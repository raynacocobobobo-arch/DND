import { existsSync, mkdirSync, readdirSync, renameSync, rmSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

function backupFilename(now) {
  return `hermestodo-${now.toISOString().replaceAll(":", "-").replaceAll(".", "-")}.sqlite`;
}

function pruneBackups(backupDirectory, retention) {
  const files = readdirSync(backupDirectory)
    .filter((name) => /^hermestodo-.*\.sqlite$/u.test(name))
    .sort()
    .reverse();
  for (const filename of files.slice(retention)) unlinkSync(resolve(backupDirectory, filename));
}

export async function backupDatabase({
  databasePath,
  backupDirectory,
  now = new Date(),
  retention = 14
}) {
  if (!existsSync(databasePath)) throw new Error(`Database does not exist: ${databasePath}`);
  if (!Number.isInteger(retention) || retention < 1) throw new Error("Retention must be a positive integer");
  mkdirSync(backupDirectory, { recursive: true });
  const destination = resolve(backupDirectory, backupFilename(now));
  const temporary = `${destination}.partial`;
  rmSync(temporary, { force: true });
  const db = new Database(databasePath, { fileMustExist: true });
  try {
    await db.backup(temporary);
    renameSync(temporary, destination);
  } finally {
    db.close();
    rmSync(temporary, { force: true });
  }
  pruneBackups(backupDirectory, retention);
  return destination;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const databasePath = resolve(process.env.DATABASE_PATH ?? "data/hermestodo.sqlite");
  const backupDirectory = resolve(process.env.BACKUP_DIRECTORY ?? "backups");
  backupDatabase({ databasePath, backupDirectory })
    .then((destination) => console.log(destination))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
