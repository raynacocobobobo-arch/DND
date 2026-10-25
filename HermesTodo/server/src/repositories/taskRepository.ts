import { randomUUID } from "node:crypto";
import type Database from "better-sqlite3";

import type { Priority, RepeatInterval } from "../../../shared/contracts";
import { nextOccurrence } from "../domain/recurrence";

interface TaskRow {
  id: string;
  title: string;
  notes: string;
  priority: Priority;
  due_at: string | null;
  is_completed: number;
  completed_at: string | null;
  context_id: string | null;
  parent_task_id: string | null;
  repeat_interval: RepeatInterval;
  repeat_rule: string;
  created_at: string;
  updated_at: string;
}

export interface TaskRecord {
  id: string;
  title: string;
  notes: string;
  priority: Priority;
  dueAt: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  contextId: string | null;
  parentTaskId: string | null;
  repeatInterval: RepeatInterval;
  repeatRule: string;
  createdAt: string;
  updatedAt: string;
  subtasks: TaskRecord[];
}

export interface CreateTaskInput {
  title: string;
  notes?: string;
  priority?: Priority;
  dueAt?: string | null;
  contextId?: string | null;
  parentTaskId?: string | null;
  repeatInterval?: RepeatInterval;
  repeatRule?: string;
}

export type UpdateTaskInput = Partial<Omit<CreateTaskInput, "parentTaskId">>;
export type TaskSort = "priority" | "dueDate" | "createdAt";

export class SubtaskDepthError extends Error {}

function mapRow(row: TaskRow, subtasks: TaskRecord[] = []): TaskRecord {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    priority: row.priority,
    dueAt: row.due_at,
    isCompleted: row.is_completed === 1,
    completedAt: row.completed_at,
    contextId: row.context_id,
    parentTaskId: row.parent_task_id,
    repeatInterval: row.repeat_interval,
    repeatRule: row.repeat_rule,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    subtasks
  };
}

export function createTaskRepository(db: Database.Database) {
  const selectById = db.prepare("SELECT * FROM tasks WHERE id = ?");
  const selectChildren = db.prepare("SELECT * FROM tasks WHERE parent_task_id = ? ORDER BY created_at ASC");

  function find(id: string): TaskRecord | null {
    const row = selectById.get(id) as TaskRow | undefined;
    if (!row) {
      return null;
    }
    const children = (selectChildren.all(id) as TaskRow[]).map((child) => mapRow(child));
    return mapRow(row, children);
  }

  function list(filters: { search?: string; contextId?: string; sort: TaskSort }): TaskRecord[] {
    const clauses = ["parent_task_id IS NULL"];
    const parameters: string[] = [];
    if (filters.search) {
      clauses.push("(LOWER(title) LIKE LOWER(?) OR LOWER(notes) LIKE LOWER(?))");
      const pattern = `%${filters.search}%`;
      parameters.push(pattern, pattern);
    }
    if (filters.contextId) {
      clauses.push("context_id = ?");
      parameters.push(filters.contextId);
    }

    const orderBy: Record<TaskSort, string> = {
      priority: `CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
        CASE WHEN due_at IS NULL THEN 1 ELSE 0 END, due_at ASC, created_at DESC`,
      dueDate: `CASE WHEN due_at IS NULL THEN 1 ELSE 0 END, due_at ASC,
        CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END, created_at DESC`,
      createdAt: "created_at DESC"
    };
    const rows = db
      .prepare(`SELECT * FROM tasks WHERE ${clauses.join(" AND ")} ORDER BY ${orderBy[filters.sort]}`)
      .all(...parameters) as TaskRow[];
    return rows.map((row) => find(row.id)!);
  }

  function create(input: CreateTaskInput, now: Date): TaskRecord {
    let parentTaskId = input.parentTaskId ?? null;
    let contextId = input.contextId ?? null;
    let dueAt = input.dueAt ?? null;
    let repeatInterval = input.repeatInterval ?? "none";
    let repeatRule = input.repeatRule ?? "";
    if (parentTaskId) {
      const parent = selectById.get(parentTaskId) as TaskRow | undefined;
      if (!parent || parent.parent_task_id) {
        throw new SubtaskDepthError();
      }
      contextId = null;
      dueAt = null;
      repeatInterval = "none";
      repeatRule = "";
    }

    const id = randomUUID();
    const timestamp = now.toISOString();
    db.prepare(
      `INSERT INTO tasks
       (id, title, notes, priority, due_at, is_completed, completed_at, context_id, parent_task_id,
        repeat_interval, repeat_rule, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 0, NULL, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      input.title.trim(),
      input.notes?.trim() ?? "",
      input.priority ?? "medium",
      dueAt,
      contextId,
      parentTaskId,
      repeatInterval,
      repeatRule,
      timestamp,
      timestamp
    );
    return find(id)!;
  }

  function update(id: string, input: UpdateTaskInput, now: Date): TaskRecord | null {
    const existing = find(id);
    if (!existing) {
      return null;
    }
    const isSubtask = existing.parentTaskId !== null;
    db.prepare(
      `UPDATE tasks SET
        title = ?, notes = ?, priority = ?, due_at = ?, context_id = ?, repeat_interval = ?,
        repeat_rule = ?, updated_at = ?
       WHERE id = ?`
    ).run(
      input.title?.trim() ?? existing.title,
      input.notes?.trim() ?? existing.notes,
      input.priority ?? existing.priority,
      isSubtask ? null : input.dueAt === undefined ? existing.dueAt : input.dueAt,
      isSubtask ? null : input.contextId === undefined ? existing.contextId : input.contextId,
      isSubtask ? "none" : input.repeatInterval ?? existing.repeatInterval,
      isSubtask ? "" : input.repeatRule ?? existing.repeatRule,
      now.toISOString(),
      id
    );
    return find(id);
  }

  function toggle(id: string, now: Date): TaskRecord | null {
    const existing = find(id);
    if (!existing) {
      return null;
    }
    const completed = !existing.isCompleted;
    db.transaction(() => {
      db.prepare("UPDATE tasks SET is_completed = ?, completed_at = ?, updated_at = ? WHERE id = ?").run(
        completed ? 1 : 0,
        completed ? now.toISOString() : null,
        now.toISOString(),
        id
      );

      if (completed && existing.repeatInterval !== "none") {
        const next = nextOccurrence(
          { interval: existing.repeatInterval, customRule: existing.repeatRule },
          existing.dueAt ? new Date(existing.dueAt) : null,
          now,
          "Asia/Shanghai"
        );
        if (next) {
          create(
            {
              title: existing.title,
              notes: existing.notes,
              priority: existing.priority,
              dueAt: next.toISOString(),
              contextId: existing.contextId,
              repeatInterval: existing.repeatInterval,
              repeatRule: existing.repeatRule
            },
            now
          );
        }
      }
    })();
    return find(id);
  }

  function remove(id: string): boolean {
    return db.prepare("DELETE FROM tasks WHERE id = ?").run(id).changes > 0;
  }

  return { create, find, list, remove, toggle, update };
}
