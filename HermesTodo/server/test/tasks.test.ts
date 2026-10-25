import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import argon2 from "argon2";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { createApp, type AppDependencies } from "../src/app";
import { createDatabase } from "../src/db/database";

const directory = mkdtempSync(join(tmpdir(), "hermestodo-tasks-"));
let currentTime = new Date("2026-10-25T08:00:00.000Z");
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
    now: () => currentTime
  };
  agent = request.agent(createApp(dependencies));
  await agent.post("/api/auth/login").send({ password: "test-password" }).expect(200);
});

afterAll(() => {
  dependencies.db.close();
  rmSync(directory, { force: true, recursive: true });
});

async function createContext(name: string): Promise<string> {
  const response = await agent.post("/api/contexts").send({ name }).expect(201);
  return response.body.id as string;
}

describe("task API", () => {
  test("creates tasks with explicit home date or no context date and keeps notes and priority", async () => {
    const contextId = await createContext("任务测试情境");
    const homeTask = await agent
      .post("/api/tasks")
      .send({
        title: "今日重点",
        notes: "下午完成",
        priority: "high",
        dueAt: "2026-10-25T09:30:00.000Z"
      })
      .expect(201);
    const contextTask = await agent
      .post("/api/tasks")
      .send({ title: "情境内任务", contextId })
      .expect(201);

    expect(homeTask.body).toMatchObject({
      title: "今日重点",
      notes: "下午完成",
      priority: "high",
      dueAt: "2026-10-25T09:30:00.000Z",
      contextId: null,
      isCompleted: false
    });
    expect(contextTask.body).toMatchObject({ contextId, dueAt: null, priority: "medium" });
  });

  test("searches titles and notes and applies all three sort modes", async () => {
    const cases = [
      { title: "sort-case-low", notes: "needle-z", priority: "low", dueAt: null },
      { title: "sort-case-high-late", notes: "needle-y", priority: "high", dueAt: "2026-10-28T08:00:00.000Z" },
      { title: "sort-case-high-early", notes: "needle-x", priority: "high", dueAt: "2026-10-26T08:00:00.000Z" }
    ];
    for (const [index, item] of cases.entries()) {
      currentTime = new Date(`2026-10-25T08:0${index}:00.000Z`);
      await agent.post("/api/tasks").send(item).expect(201);
    }

    const byPriority = await agent.get("/api/tasks?search=sort-case&sort=priority").expect(200);
    expect(byPriority.body.map((task: { title: string }) => task.title)).toEqual([
      "sort-case-high-early",
      "sort-case-high-late",
      "sort-case-low"
    ]);

    const byDue = await agent.get("/api/tasks?search=needle&sort=dueDate").expect(200);
    expect(byDue.body.map((task: { title: string }) => task.title)).toEqual([
      "sort-case-high-early",
      "sort-case-high-late",
      "sort-case-low"
    ]);

    const byCreated = await agent.get("/api/tasks?search=sort-case&sort=createdAt").expect(200);
    expect(byCreated.body.map((task: { title: string }) => task.title)).toEqual([
      "sort-case-high-early",
      "sort-case-high-late",
      "sort-case-low"
    ]);
  });

  test("moves a parent context while its one-level subtasks remain attached to the parent", async () => {
    const fromContext = await createContext("移动前");
    const toContext = await createContext("移动后");
    const parent = await agent
      .post("/api/tasks")
      .send({ title: "父任务", contextId: fromContext })
      .expect(201);
    const child = await agent
      .post("/api/tasks")
      .send({ title: "子任务", parentTaskId: parent.body.id, contextId: toContext })
      .expect(201);

    expect(child.body).toMatchObject({ parentTaskId: parent.body.id, contextId: null });
    await agent.patch(`/api/tasks/${parent.body.id}`).send({ contextId: toContext }).expect(200);

    const response = await agent.get(`/api/tasks?search=父任务`).expect(200);
    expect(response.body[0]).toMatchObject({ contextId: toContext });
    expect(response.body[0].subtasks).toEqual([
      expect.objectContaining({ id: child.body.id, contextId: null, title: "子任务" })
    ]);
  });

  test("keeps inbox separate from each scene and moves tasks without making duplicates", async () => {
    const sceneId = await createContext("归属隔离测试");
    const inboxTask = await agent.post("/api/tasks").send({ title: "归属隔离-收集箱" }).expect(201);
    const sceneTask = await agent.post("/api/tasks").send({
      title: "归属隔离-情境任务", contextId: sceneId
    }).expect(201);
    const child = await agent.post("/api/tasks").send({
      title: "归属隔离-子任务", parentTaskId: sceneTask.body.id
    }).expect(201);

    const home = await agent.get("/api/tasks?scope=inbox&sort=createdAt").expect(200);
    expect(home.body.some((t: { id: string }) => t.id === inboxTask.body.id)).toBe(true);
    expect(home.body.some((t: { id: string }) => t.id === sceneTask.body.id)).toBe(false);
    expect(home.body.some((t: { id: string }) => t.id === child.body.id)).toBe(false);

    const scene = await agent.get(`/api/tasks?contextId=${sceneId}&sort=createdAt`).expect(200);
    expect(scene.body).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: sceneTask.body.id, subtasks: [
        expect.objectContaining({ id: child.body.id })
      ] })
    ]));
    expect(scene.body.some((t: { id: string }) => t.id === inboxTask.body.id)).toBe(false);

    await agent.patch(`/api/tasks/${inboxTask.body.id}`).send({ contextId: sceneId }).expect(200);
    const movedHome = await agent.get("/api/tasks?scope=inbox").expect(200);
    const movedScene = await agent.get(`/api/tasks?contextId=${sceneId}`).expect(200);
    expect(movedHome.body.some((t: { id: string }) => t.id === inboxTask.body.id)).toBe(false);
    expect(movedScene.body.filter((t: { id: string }) => t.id === inboxTask.body.id)).toHaveLength(1);

    await agent.get(`/api/tasks?scope=inbox&contextId=${sceneId}`).expect(400);
  });

  test("rejects grandchildren", async () => {
    const parent = await agent.post("/api/tasks").send({ title: "一层父" }).expect(201);
    const child = await agent
      .post("/api/tasks")
      .send({ title: "一层子", parentTaskId: parent.body.id })
      .expect(201);
    const response = await agent
      .post("/api/tasks")
      .send({ title: "二层子", parentTaskId: child.body.id });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: { code: "SUBTASK_DEPTH", message: "子任务只支持一层" } });
  });

  test("completing and reopening a parent does not change its child", async () => {
    const parent = await agent.post("/api/tasks").send({ title: "独立完成父" }).expect(201);
    const child = await agent
      .post("/api/tasks")
      .send({ title: "独立完成子", parentTaskId: parent.body.id })
      .expect(201);
    await agent.post(`/api/tasks/${child.body.id}/toggle`).expect(200);

    const completedParent = await agent.post(`/api/tasks/${parent.body.id}/toggle`).expect(200);
    expect(completedParent.body).toMatchObject({ isCompleted: true });
    expect(completedParent.body.subtasks[0]).toMatchObject({ id: child.body.id, isCompleted: true });

    const reopenedParent = await agent.post(`/api/tasks/${parent.body.id}/toggle`).expect(200);
    expect(reopenedParent.body).toMatchObject({ isCompleted: false });
    expect(reopenedParent.body.subtasks[0]).toMatchObject({ id: child.body.id, isCompleted: true });
  });

  test("deleting a parent cascades to its child", async () => {
    const parent = await agent.post("/api/tasks").send({ title: "待删父" }).expect(201);
    const child = await agent
      .post("/api/tasks")
      .send({ title: "待删子", parentTaskId: parent.body.id })
      .expect(201);

    await agent.delete(`/api/tasks/${parent.body.id}`).expect(204);

    expect(dependencies.db.prepare("SELECT id FROM tasks WHERE id IN (?, ?)").all(parent.body.id, child.body.id)).toEqual([]);
  });

  test("allows user-created duplicate titles", async () => {
    await agent.post("/api/tasks").send({ title: "可重复标题" }).expect(201);
    await agent.post("/api/tasks").send({ title: "可重复标题" }).expect(201);

    const response = await agent.get(`/api/tasks?search=${encodeURIComponent("可重复标题")}`).expect(200);
    expect(response.body).toHaveLength(2);
  });
});
