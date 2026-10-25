import { randomUUID } from "node:crypto";
import type Database from "better-sqlite3";

import { normalizeContextName } from "../domain/normalization";

interface ContextRow {
  id: string;
  name: string;
  icon: string;
  color: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  incomplete_count: number;
}

export interface ContextRecord {
  id: string;
  name: string;
  icon: string;
  color: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  incompleteCount: number;
}

export interface CreateContextInput {
  name: string;
  icon: string;
  color: string;
}

export interface UpdateContextInput {
  name?: string;
  icon?: string;
  color?: string;
  sortOrder?: number;
}

function mapContext(row: ContextRow): ContextRecord {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    incompleteCount: row.incomplete_count
  };
}

export function createContextRepository(db: Database.Database) {
  const select = `
    SELECT c.*,
      COUNT(CASE WHEN t.is_completed = 0 AND t.parent_task_id IS NULL THEN 1 END) AS incomplete_count
    FROM contexts c
    LEFT JOIN tasks t ON t.context_id = c.id
  `;

  function list(): ContextRecord[] {
    const rows = db
      .prepare(`${select} GROUP BY c.id ORDER BY c.sort_order ASC, c.created_at ASC`)
      .all() as ContextRow[];
    return rows.map(mapContext);
  }

  function find(id: string): ContextRecord | null {
    const row = db.prepare(`${select} WHERE c.id = ? GROUP BY c.id`).get(id) as ContextRow | undefined;
    return row ? mapContext(row) : null;
  }

  function create(input: CreateContextInput, now: Date): ContextRecord {
    const id = randomUUID();
    const timestamp = now.toISOString();
    const nextOrder = (
      db.prepare("SELECT COALESCE(MAX(sort_order), -1) + 1 AS value FROM contexts").get() as { value: number }
    ).value;
    const name = input.name.trim();

    db.prepare(
      `INSERT INTO contexts
       (id, name, normalized_name, icon, color, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, name, normalizeContextName(name), input.icon, input.color, nextOrder, timestamp, timestamp);

    return find(id)!;
  }

  function update(id: string, input: UpdateContextInput, now: Date): ContextRecord | null {
    const existing = find(id);
    if (!existing) {
      return null;
    }
    const name = input.name?.trim() ?? existing.name;
    db.prepare(
      `UPDATE contexts
       SET name = ?, normalized_name = ?, icon = ?, color = ?, sort_order = ?, updated_at = ?
       WHERE id = ?`
    ).run(
      name,
      normalizeContextName(name),
      input.icon ?? existing.icon,
      input.color ?? existing.color,
      input.sortOrder ?? existing.sortOrder,
      now.toISOString(),
      id
    );
    return find(id);
  }

  function remove(id: string): boolean {
    return db.prepare("DELETE FROM contexts WHERE id = ?").run(id).changes > 0;
  }

  return { create, find, list, remove, update };
}
