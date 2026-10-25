import Database from "better-sqlite3";

import { runMigrations } from "./migrations";

export function createDatabase(filename: string): Database.Database {
  const db = new Database(filename);
  db.pragma("foreign_keys = ON");
  db.pragma("journal_mode = WAL");
  runMigrations(db);
  return db;
}
