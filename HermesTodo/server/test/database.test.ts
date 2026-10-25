import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

import { createDatabase } from "../src/db/database";

const tempDirectories: string[] = [];

function temporaryDatabasePath(): string {
  const directory = mkdtempSync(join(tmpdir(), "hermestodo-db-"));
  tempDirectories.push(directory);
  return join(directory, "test.sqlite");
}

afterEach(() => {
  for (const directory of tempDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true });
  }
});

describe("database migrations", () => {
  test("creates the complete schema with foreign keys and WAL enabled", () => {
    const db = createDatabase(temporaryDatabasePath());

    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
      .all()
      .map((row) => (row as { name: string }).name);

    expect(tables).toEqual(
      expect.arrayContaining(["app_settings", "contexts", "schema_migrations", "sessions", "tasks"])
    );
    expect(db.pragma("foreign_keys", { simple: true })).toBe(1);
    expect(db.pragma("journal_mode", { simple: true })).toBe("wal");

    const taskColumns = db.prepare("PRAGMA table_info(tasks)").all() as Array<{ name: string }>;
    expect(taskColumns.map((column) => column.name)).not.toContain("sort_order");

    db.close();
  });

  test("deleting a context keeps its tasks and clears their context", () => {
    const db = createDatabase(temporaryDatabasePath());
    const now = "2026-10-25T08:00:00.000Z";

    db.prepare(
      "INSERT INTO contexts (id, name, normalized_name, icon, color, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    ).run("context-1", "工作", "工作", "briefcase", "#8CAABA", 0, now, now);
    db.prepare(
      "INSERT INTO tasks (id, title, notes, priority, is_completed, context_id, repeat_interval, repeat_rule, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run("task-1", "写周报", "", "medium", 0, "context-1", "none", "", now, now);

    db.prepare("DELETE FROM contexts WHERE id = ?").run("context-1");

    expect(db.prepare("SELECT context_id FROM tasks WHERE id = ?").get("task-1")).toEqual({ context_id: null });
    db.close();
  });

  test("deleting a parent task cascades to its subtasks", () => {
    const db = createDatabase(temporaryDatabasePath());
    const now = "2026-10-25T08:00:00.000Z";
    const insert = db.prepare(
      "INSERT INTO tasks (id, title, notes, priority, is_completed, parent_task_id, repeat_interval, repeat_rule, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );

    insert.run("parent", "打包", "", "medium", 0, null, "none", "", now, now);
    insert.run("child", "收护照", "", "medium", 0, "parent", "none", "", now, now);
    db.prepare("DELETE FROM tasks WHERE id = ?").run("parent");

    expect(db.prepare("SELECT COUNT(*) AS count FROM tasks").get()).toEqual({ count: 0 });
    db.close();
  });
});
