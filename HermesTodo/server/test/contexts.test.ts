import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import argon2 from "argon2";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { createApp, type AppDependencies } from "../src/app";
import { createDatabase } from "../src/db/database";

const directory = mkdtempSync(join(tmpdir(), "hermestodo-contexts-"));
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

describe("context API", () => {
  test("creates and lists contexts in explicit order with icon and color", async () => {
    const travel = await agent
      .post("/api/contexts")
      .send({ name: "旅行", icon: "plane", color: "#EEB0A8" })
      .expect(201);
    const work = await agent
      .post("/api/contexts")
      .send({ name: "工作", icon: "briefcase", color: "#8CAABA" })
      .expect(201);

    expect(travel.body).toMatchObject({
      name: "旅行",
      icon: "plane",
      color: "#EEB0A8",
      sortOrder: 0,
      incompleteCount: 0
    });
    expect(work.body.sortOrder).toBe(1);

    await agent.patch(`/api/contexts/${work.body.id}`).send({ sortOrder: -1 }).expect(200);
    const list = await agent.get("/api/contexts").expect(200);
    expect(list.body.map((context: { name: string }) => context.name)).toEqual(["工作", "旅行"]);
  });

  test("rejects a duplicate normalized name but keeps punctuation distinct", async () => {
    await agent.post("/api/contexts").send({ name: "Work-A" }).expect(201);
    const duplicate = await agent.post("/api/contexts").send({ name: "  work-a  " });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body).toEqual({ error: { code: "CONTEXT_EXISTS", message: "已有同名情境" } });

    await agent.post("/api/contexts").send({ name: "WorkA" }).expect(201);
  });

  test("updates name, icon, and color", async () => {
    const created = await agent.post("/api/contexts").send({ name: "旧名" }).expect(201);
    const updated = await agent
      .patch(`/api/contexts/${created.body.id}`)
      .send({ name: "新名", icon: "heart", color: "#B1C8A5" })
      .expect(200);

    expect(updated.body).toMatchObject({ name: "新名", icon: "heart", color: "#B1C8A5" });
  });

  test("deleting a context keeps its task and clears the relation", async () => {
    const created = await agent.post("/api/contexts").send({ name: "临时情境" }).expect(201);
    const now = "2026-10-25T08:00:00.000Z";
    dependencies.db
      .prepare(
        "INSERT INTO tasks (id, title, notes, priority, is_completed, context_id, repeat_interval, repeat_rule, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .run("kept-task", "保留任务", "", "medium", 0, created.body.id, "none", "", now, now);

    await agent.delete(`/api/contexts/${created.body.id}`).expect(204);

    expect(dependencies.db.prepare("SELECT context_id FROM tasks WHERE id = ?").get("kept-task")).toEqual({
      context_id: null
    });
  });
});
