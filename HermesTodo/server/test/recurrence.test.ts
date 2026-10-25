import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import argon2 from "argon2";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { createApp, type AppDependencies } from "../src/app";
import { createDatabase } from "../src/db/database";
import { nextOccurrence, type RepeatRule } from "../src/domain/recurrence";

const timeZone = "Asia/Shanghai";

function next(rule: RepeatRule, scheduledAt: string | null, completedAt: string): string | null {
  return nextOccurrence(
    rule,
    scheduledAt ? new Date(scheduledAt) : null,
    new Date(completedAt),
    timeZone
  )?.toISOString() ?? null;
}

describe("nextOccurrence", () => {
  test.each([
    [{ interval: "daily" }, "2026-10-25T01:30:00.000Z", "2026-10-25T02:00:00.000Z", "2026-10-26T01:30:00.000Z"],
    [{ interval: "weekly" }, "2026-10-25T01:30:00.000Z", "2026-10-25T02:00:00.000Z", "2026-11-01T01:30:00.000Z"],
    [{ interval: "monthly" }, "2027-01-31T01:30:00.000Z", "2027-01-31T02:00:00.000Z", "2027-02-28T01:30:00.000Z"],
    [{ interval: "yearly" }, "2028-02-29T01:30:00.000Z", "2028-03-01T00:00:00.000Z", "2029-02-28T01:30:00.000Z"],
    [{ interval: "custom", customRule: "每周三" }, "2026-10-26T01:30:00.000Z", "2026-10-26T02:00:00.000Z", "2026-10-28T01:30:00.000Z"],
    [{ interval: "custom", customRule: "每月31日" }, "2027-04-15T01:30:00.000Z", "2027-04-15T02:00:00.000Z", "2027-04-30T01:30:00.000Z"]
  ] as const)("computes %o in Asia/Shanghai", (rule, scheduledAt, completedAt, expected) => {
    expect(next(rule, scheduledAt, completedAt)).toBe(expected);
  });

  test("keeps a monthly leap-day cadence anchored to the original day", () => {
    expect(next({ interval: "monthly" }, "2028-01-31T01:30:00.000Z", "2028-01-31T02:00:00.000Z")).toBe(
      "2028-02-29T01:30:00.000Z"
    );
  });

  test("advances a long-overdue cadence to exactly the first future occurrence", () => {
    expect(next({ interval: "daily" }, "2026-10-20T01:30:00.000Z", "2026-10-25T04:00:00.000Z")).toBe(
      "2026-10-26T01:30:00.000Z"
    );
  });

  test("uses completion time as the schedule when no due date exists", () => {
    expect(next({ interval: "daily" }, null, "2026-10-25T15:30:00.000Z")).toBe("2026-10-26T15:30:00.000Z");
  });

  test("returns null for non-repeating tasks", () => {
    expect(next({ interval: "none" }, "2026-10-25T01:30:00.000Z", "2026-10-25T02:00:00.000Z")).toBeNull();
  });
});

describe("recurring task API", () => {
  const directory = mkdtempSync(join(tmpdir(), "hermestodo-recurrence-"));
  let dependencies: AppDependencies;
  let currentTime = new Date("2026-10-25T04:00:00.000Z");
  let agent: ReturnType<typeof request.agent>;

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
      now: () => currentTime
    };
    agent = request.agent(createApp(dependencies));
    await agent.post("/api/auth/login").send({ password: "test-password" }).expect(200);
  });

  afterAll(() => {
    dependencies.db.close();
    rmSync(directory, { force: true, recursive: true });
  });

  test("completing an overdue recurring task creates one independent future task", async () => {
    const created = await agent
      .post("/api/tasks")
      .send({
        title: "每日复习",
        dueAt: "2026-10-20T01:30:00.000Z",
        repeatInterval: "daily"
      })
      .expect(201);

    const completed = await agent.post(`/api/tasks/${created.body.id}/toggle`).expect(200);
    expect(completed.body).toMatchObject({ id: created.body.id, isCompleted: true });

    const rows = dependencies.db
      .prepare("SELECT id, due_at, is_completed FROM tasks WHERE title = ? ORDER BY created_at ASC")
      .all("每日复习");
    expect(rows).toEqual([
      { id: created.body.id, due_at: "2026-10-20T01:30:00.000Z", is_completed: 1 },
      expect.objectContaining({ due_at: "2026-10-26T01:30:00.000Z", is_completed: 0 })
    ]);
  });

  test("rejects an unsupported custom recurrence rule", async () => {
    const response = await agent
      .post("/api/tasks")
      .send({ title: "无效重复", repeatInterval: "custom", repeatRule: "隔一天" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: { code: "INVALID_REPEAT_RULE", message: "自定义重复只支持每周X或每月N日" } });
  });
});
