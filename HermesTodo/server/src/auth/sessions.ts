import { createHmac, randomBytes } from "node:crypto";
import type Database from "better-sqlite3";

export const SESSION_COOKIE_NAME = "hermestodo_session";

interface SessionRecord {
  id_hash: string;
  expires_at: string;
}

function hashToken(token: string, secret: string): string {
  return createHmac("sha256", secret).update(token).digest("hex");
}

function expiryFrom(now: Date, ttlDays: number): string {
  return new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000).toISOString();
}

export function createSession(
  db: Database.Database,
  secret: string,
  now: Date,
  ttlDays: number
): string {
  const token = randomBytes(32).toString("base64url");
  const timestamp = now.toISOString();
  db.prepare(
    "INSERT INTO sessions (id_hash, created_at, last_seen_at, expires_at) VALUES (?, ?, ?, ?)"
  ).run(hashToken(token, secret), timestamp, timestamp, expiryFrom(now, ttlDays));
  return token;
}

export function findSession(
  db: Database.Database,
  token: string,
  secret: string,
  now: Date,
  ttlDays: number
): string | null {
  const idHash = hashToken(token, secret);
  const record = db.prepare("SELECT id_hash, expires_at FROM sessions WHERE id_hash = ?").get(idHash) as
    | SessionRecord
    | undefined;

  if (!record) {
    return null;
  }

  if (new Date(record.expires_at).getTime() <= now.getTime()) {
    db.prepare("DELETE FROM sessions WHERE id_hash = ?").run(idHash);
    return null;
  }

  db.prepare("UPDATE sessions SET last_seen_at = ?, expires_at = ? WHERE id_hash = ?").run(
    now.toISOString(),
    expiryFrom(now, ttlDays),
    idHash
  );
  return idHash;
}

export function deleteSession(db: Database.Database, token: string, secret: string): void {
  db.prepare("DELETE FROM sessions WHERE id_hash = ?").run(hashToken(token, secret));
}

export function readSessionToken(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) {
    return null;
  }

  for (const cookie of cookieHeader.split(";")) {
    const [name, ...valueParts] = cookie.trim().split("=");
    if (name === SESSION_COOKIE_NAME) {
      return decodeURIComponent(valueParts.join("="));
    }
  }
  return null;
}
