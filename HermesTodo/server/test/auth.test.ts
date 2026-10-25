import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import argon2 from "argon2";
import request from "supertest";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

import { createApp, type AppDependencies } from "../src/app";
import { createDatabase } from "../src/db/database";

let passwordHash = "";
const tempDirectories: string[] = [];

beforeAll(async () => {
  passwordHash = await argon2.hash("correct horse battery staple");
});

afterEach(() => {
  for (const directory of tempDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true });
  }
});

function testDependencies(overrides: Partial<AppDependencies> = {}): AppDependencies {
  const directory = mkdtempSync(join(tmpdir(), "hermestodo-auth-"));
  tempDirectories.push(directory);

  return {
    db: createDatabase(join(directory, "test.sqlite")),
    config: {
      authPasswordHash: passwordHash,
      sessionSecret: "0123456789abcdef0123456789abcdef",
      cookieSecure: false,
      sessionTtlDays: 30,
      publicOrigin: "http://127.0.0.1:3020"
    },
    now: () => new Date("2026-10-25T08:00:00.000Z"),
    loginRateLimit: { limit: 5, windowMs: 60_000 },
    ...overrides
  };
}

describe("single-user authentication", () => {
  test("rejects a missing password with a validation error", async () => {
    const response = await request(createApp(testDependencies())).post("/api/auth/login").send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: { code: "INVALID_REQUEST", message: "请输入密码" } });
  });

  test("rejects an incorrect password without creating a session", async () => {
    const deps = testDependencies();
    const response = await request(createApp(deps)).post("/api/auth/login").send({ password: "wrong" });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: { code: "INVALID_CREDENTIALS", message: "密码不正确" } });
    expect(deps.db.prepare("SELECT COUNT(*) AS count FROM sessions").get()).toEqual({ count: 0 });
  });

  test("creates an opaque HttpOnly session cookie and stores only its hash", async () => {
    const deps = testDependencies();
    const response = await request(createApp(deps))
      .post("/api/auth/login")
      .send({ password: "correct horse battery staple" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ authenticated: true });

    const cookie = response.headers["set-cookie"]?.[0] ?? "";
    expect(cookie).toContain("hermestodo_session=");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).not.toContain("Secure");
    expect(cookie).not.toContain("correct horse battery staple");

    const rawToken = cookie.match(/hermestodo_session=([^;]+)/)?.[1] ?? "";
    const stored = deps.db.prepare("SELECT id_hash FROM sessions").get() as { id_hash: string };
    expect(rawToken).not.toBe("");
    expect(stored.id_hash).not.toBe(rawToken);
    expect(stored.id_hash).toMatch(/^[a-f0-9]{64}$/);
  });

  test("marks the session authenticated until it expires after 30 idle days", async () => {
    let now = new Date("2026-10-25T08:00:00.000Z");
    const deps = testDependencies({ now: () => now });
    const agent = request.agent(createApp(deps));

    await agent.post("/api/auth/login").send({ password: "correct horse battery staple" }).expect(200);
    await agent.get("/api/session").expect(200, { authenticated: true });

    now = new Date("2026-11-25T08:00:01.000Z");
    await agent.get("/api/session").expect(401, {
      error: { code: "UNAUTHENTICATED", message: "请先登录" }
    });
    expect(deps.db.prepare("SELECT COUNT(*) AS count FROM sessions").get()).toEqual({ count: 0 });
  });

  test("logout invalidates the server session and clears the cookie", async () => {
    const deps = testDependencies();
    const agent = request.agent(createApp(deps));

    await agent.post("/api/auth/login").send({ password: "correct horse battery staple" }).expect(200);
    const response = await agent.post("/api/auth/logout").expect(204);

    expect(response.headers["set-cookie"]?.[0] ?? "").toContain("hermestodo_session=;");
    await agent.get("/api/session").expect(401);
    expect(deps.db.prepare("SELECT COUNT(*) AS count FROM sessions").get()).toEqual({ count: 0 });
  });

  test("adds Secure when configured for the 8443 HTTPS deployment", async () => {
    const deps = testDependencies();
    deps.config.cookieSecure = true;

    const response = await request(createApp(deps))
      .post("/api/auth/login")
      .send({ password: "correct horse battery staple" });

    expect(response.headers["set-cookie"]?.[0] ?? "").toContain("Secure");
  });

  test("rate limits repeated password guesses", async () => {
    const deps = testDependencies({ loginRateLimit: { limit: 2, windowMs: 60_000 } });
    const app = createApp(deps);

    await request(app).post("/api/auth/login").send({ password: "wrong-1" }).expect(401);
    await request(app).post("/api/auth/login").send({ password: "wrong-2" }).expect(401);
    const response = await request(app).post("/api/auth/login").send({ password: "wrong-3" });

    expect(response.status).toBe(429);
    expect(response.body).toEqual({ error: { code: "RATE_LIMITED", message: "尝试次数过多，请稍后再试" } });
  });
});
