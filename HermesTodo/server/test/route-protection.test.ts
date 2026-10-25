import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import argon2 from "argon2";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { createApp, type AppDependencies } from "../src/app";
import { createDatabase } from "../src/db/database";

const directory = mkdtempSync(join(tmpdir(), "hermestodo-protection-"));
let dependencies: AppDependencies;

beforeAll(async () => {
  dependencies = {
    db: createDatabase(join(directory, "test.sqlite")),
    config: {
      authPasswordHash: await argon2.hash("test-password"),
      sessionSecret: "0123456789abcdef0123456789abcdef",
      cookieSecure: false,
      sessionTtlDays: 30,
      publicOrigin: "http://127.0.0.1:3020"
    },
    now: () => new Date("2026-10-25T08:00:00.000Z")
  };
});

afterAll(() => {
  dependencies.db.close();
  rmSync(directory, { force: true, recursive: true });
});

describe("business route protection", () => {
  test.each([
    ["get", "/api/contexts"],
    ["get", "/api/tasks"],
    ["post", "/api/ai/plan"]
  ] as const)("returns the shared 401 envelope for unauthenticated %s %s", async (method, path) => {
    const response = await request(createApp(dependencies))[method](path);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: { code: "UNAUTHENTICATED", message: "请先登录" } });
  });

  test("rejects an authenticated state-changing request from another origin", async () => {
    const agent = request.agent(createApp(dependencies));
    await agent.post("/api/auth/login").send({ password: "test-password" }).expect(200);

    const response = await agent.post("/api/tasks").set("Origin", "https://evil.example").send({ title: "x" });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: { code: "ORIGIN_NOT_ALLOWED", message: "请求来源不受信任" } });
  });

  test("allows the configured origin to reach the protected route", async () => {
    const agent = request.agent(createApp(dependencies));
    await agent.post("/api/auth/login").send({ password: "test-password" }).expect(200);

    const response = await agent
      .post("/api/tasks")
      .set("Origin", "http://127.0.0.1:3020")
      .send({ title: "x" });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ title: "x", isCompleted: false });
  });
});
