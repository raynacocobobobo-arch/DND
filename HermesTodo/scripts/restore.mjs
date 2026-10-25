import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

function assertHealthyDatabase(filename) {
  const db = new Database(filename, { readonly: true, fileMustExist: true });
  try {
    const result = db.pragma("integrity_check", { simple: true });
    if (result !== "ok") throw new Error(`SQLite integrity check failed: ${String(result)}`);
  } finally {
    db.close();
  }
}

export async function restoreDatabase({ backupPath, databasePath }) {
  if (!existsSync(backupPath)) throw new Error(`Backup does not exist: ${backupPath}`);
  if (existsSync(databasePath)) throw new Error(`Restore target already exists: ${databasePath}`);
  assertHealthyDatabase(backupPath);
  mkdirSync(dirname(databasePath), { recursive: true });
  copyFileSync(backupPath, databasePath);
  assertHealthyDatabase(databasePath);
  return databasePath;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const backupPath = process.argv[2] ? resolve(process.argv[2]) : "";
  const databasePath = resolve(process.argv[3] ?? process.env.DATABASE_PATH ?? "data/hermestodo.sqlite");
  if (!backupPath) {
    console.error("Usage: node scripts/restore.mjs <backup.sqlite> [target.sqlite]");
    process.exitCode = 1;
  } else {
    restoreDatabase({ backupPath, databasePath })
      .then((destination) => console.log(destination))
      .catch((error) => {
        console.error(error instanceof Error ? error.message : String(error));
        process.exitCode = 1;
      });
  }
}
