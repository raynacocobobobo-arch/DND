import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import argon2 from "argon2";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { createApp, type AppDependencies } from "../src/app";
import { createDatabase } from "../src/db/database";

const directory = mkdtempSync(join(tmpdir(), "hermestodo-ai-commit-"));
let dependencies: AppDependencies;
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
    now: () => new Date("2026-10-25T08:00:00.000Z")
  };
  agent = request.agent(createApp(dependencies));
  await agent.post("/api/auth/login").send({ password: "test-password" }).expect(200);
});

afterAll(() => {
  dependencies.db.close();
  rmSync(directory, { force: true, recursive: true });
});

function suggestion(overrides: Record<string, unknown> = {}) {
  return {
    title: "护照",
    category: "核心证件",
    note: "原件1本，有效期至少6个月",
    context: "欧洲旅行",
    priority: "high",
    ...overrides
  };
}

describe("atomic AI suggestion commit", () => {
  test("reuses a normalized context and preserves category and note text", async () => {
    const existing = await agent.post("/api/contexts").send({ name: "欧洲旅行" }).expect(201);

    const response = await agent
      .post("/api/ai/commit-suggestions")
      .send({ suggestions: [suggestion({ context: "  欧洲旅行  " })] })
      .expect(201);

    expect(response.body.context.id).toBe(existing.body.id);
    expect(response.body.createdTasks).toHaveLength(1);
    expect(response.body.createdTasks[0]).toMatchObject({
      title: "护照",
      notes: "【核心证件】\n原件1本，有效期至少6个月",
      priority: "high",
      contextId: existing.body.id
    });
    expect(dependencies.db.prepare("SELECT COUNT(*) AS count FROM contexts WHERE normalized_name = ?").get("欧洲旅行")).toEqual({ count: 1 });
  });

  test("deduplicates only top-level tasks in the same context", async () => {
    const target = await agent.post("/api/contexts").send({ name: "同境去重" }).expect(201);
    const other = await agent.post("/api/contexts").send({ name: "别的情境" }).expect(201);
    await agent.post("/api/tasks").send({ title: "打印 行程单！", contextId: target.body.id }).expect(201);
    await agent.post("/api/tasks").send({ title: "购买雨伞", contextId: other.body.id }).expect(201);
    const parent = await agent.post("/api/tasks").send({ title: "父任务", contextId: target.body.id }).expect(201);
    await agent.post("/api/tasks").send({ title: "准备药品", parentTaskId: parent.body.id }).expect(201);

    const response = await agent
      .post("/api/ai/commit-suggestions")
      .send({
        suggestions: [
          suggestion({ title: "打印行程单", context: "同境去重" }),
          suggestion({ title: "购买雨伞", context: "同境去重" }),
          suggestion({ title: "准备药品", context: "同境去重" })
        ]
      })
      .expect(201);

    expect(response.body.skippedCount).toBe(1);
    expect(response.body.createdTasks.map((task: { title: string }) => task.title)).toEqual(["购买雨伞", "准备药品"]);
  });

  test("rejects the whole batch before writing when any suggestion is invalid", async () => {
    const before = dependencies.db.prepare("SELECT COUNT(*) AS count FROM contexts").get() as { count: number };
    const response = await agent.post("/api/ai/commit-suggestions").send({
      suggestions: [suggestion({ context: "不能留下" }), suggestion({ title: "", context: "不能留下" })]
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: { code: "INVALID_REQUEST", message: "AI 待办内容无效" } });
    expect(dependencies.db.prepare("SELECT COUNT(*) AS count FROM contexts").get()).toEqual(before);
    expect(dependencies.db.prepare("SELECT COUNT(*) AS count FROM tasks WHERE title = ?").get("护照")).toEqual({ count: 1 });
    expect(dependencies.db.prepare("SELECT COUNT(*) AS count FROM contexts WHERE name = ?").get("不能留下")).toEqual({ count: 0 });
  });

  test("rejects mixed contexts as one invalid conversation batch", async () => {
    await agent
      .post("/api/ai/commit-suggestions")
      .send({ suggestions: [suggestion({ context: "旅行" }), suggestion({ title: "订会议室", context: "工作" })] })
      .expect(400, { error: { code: "MIXED_CONTEXTS", message: "一次只能写入一个情境" } });
  });
});
