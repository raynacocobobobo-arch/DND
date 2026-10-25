import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

import { createDatabase } from "../src/db/database";
// @ts-expect-error Operational scripts are intentionally plain Node ESM modules.
import { backupDatabase } from "../../scripts/backup.mjs";
// @ts-expect-error Operational scripts are intentionally plain Node ESM modules.
import { restoreDatabase } from "../../scripts/restore.mjs";

const directories: string[] = [];

afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

describe("online SQLite backup and restore", () => {
  test("backs up a live WAL database and restores contexts and tasks into a clean path", async () => {
    const directory = mkdtempSync(join(tmpdir(), "hermestodo-backup-"));
    directories.push(directory);
    const source = join(directory, "data", "hermestodo.sqlite");
    const backups = join(directory, "backups");
    const restored = join(directory, "restore", "hermestodo.sqlite");
    mkdirSync(join(directory, "data"), { recursive: true });
    const db = createDatabase(source);
    const stamp = "2026-10-25T08:00:00.000Z";
    db.prepare("INSERT INTO contexts (id, name, normalized_name, icon, color, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .run("travel", "旅行", "旅行", "suitcase", "#EEB0A8", 0, stamp, stamp);
    db.prepare("INSERT INTO tasks (id, title, notes, priority, is_completed, context_id, repeat_interval, repeat_rule, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .run("passport", "护照", "有效期6个月", "high", 0, "travel", "none", "", stamp, stamp);

    const backupPath = await backupDatabase({
      databasePath: source,
      backupDirectory: backups,
      now: new Date("2026-10-25T09:10:11.000Z")
    });
    expect(existsSync(backupPath)).toBe(true);
    await restoreDatabase({ backupPath, databasePath: restored });

    const restoredDb = createDatabase(restored);
    expect(restoredDb.prepare("SELECT name FROM contexts WHERE id = ?").get("travel")).toEqual({ name: "旅行" });
    expect(restoredDb.prepare("SELECT title, notes FROM tasks WHERE id = ?").get("passport")).toEqual({
      title: "护照",
      notes: "有效期6个月"
    });
    restoredDb.close();
    db.close();
  });

  test("retains only the newest fourteen backup files", async () => {
    const directory = mkdtempSync(join(tmpdir(), "hermestodo-retention-"));
    directories.push(directory);
    const source = join(directory, "data", "hermestodo.sqlite");
    const backups = join(directory, "backups");
    mkdirSync(join(directory, "data"), { recursive: true });
    const db = createDatabase(source);
    db.close();

    for (let day = 1; day <= 16; day += 1) {
      await backupDatabase({
        databasePath: source,
        backupDirectory: backups,
        now: new Date(Date.UTC(2026, 9, day, 2, 0, 0)),
        retention: 14
      });
    }

    const files = readdirSync(backups).filter((name) => name.endsWith(".sqlite")).sort();
    expect(files).toHaveLength(14);
    expect(files[0]).toContain("2026-10-03");
    expect(files.at(-1)).toContain("2026-10-16");
  });
});
