import type Database from "better-sqlite3";

interface Migration {
  version: number;
  sql: string;
}

const migrations: Migration[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE contexts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        normalized_name TEXT NOT NULL UNIQUE,
        icon TEXT NOT NULL DEFAULT 'folder',
        color TEXT NOT NULL DEFAULT '#8CAABA',
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        notes TEXT NOT NULL DEFAULT '',
        priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
        due_at TEXT,
        is_completed INTEGER NOT NULL DEFAULT 0 CHECK (is_completed IN (0, 1)),
        completed_at TEXT,
        context_id TEXT REFERENCES contexts(id) ON DELETE SET NULL,
        parent_task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
        repeat_interval TEXT NOT NULL DEFAULT 'none'
          CHECK (repeat_interval IN ('none', 'daily', 'weekly', 'monthly', 'yearly', 'custom')),
        repeat_rule TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX tasks_context_id_idx ON tasks(context_id);
      CREATE INDEX tasks_parent_task_id_idx ON tasks(parent_task_id);
      CREATE INDEX tasks_due_at_idx ON tasks(due_at);

      CREATE TABLE sessions (
        id_hash TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        last_seen_at TEXT NOT NULL,
        expires_at TEXT NOT NULL
      );

      CREATE INDEX sessions_expires_at_idx ON sessions(expires_at);

      CREATE TABLE app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `
  }
];

export function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  const applied = db.prepare("SELECT 1 FROM schema_migrations WHERE version = ?");
  const record = db.prepare("INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)");

  for (const migration of migrations) {
    if (applied.get(migration.version)) {
      continue;
    }

    db.transaction(() => {
      db.exec(migration.sql);
      record.run(migration.version, new Date().toISOString());
    })();
  }
}
