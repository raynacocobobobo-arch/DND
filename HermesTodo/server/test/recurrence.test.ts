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

  test("repeated checkins keep the same ID and record one completion per scheduled cycle", async () => {
    const created = await agent.post("/api/tasks").send({
      title:"每日复习",dueAt:"2026-10-20T01:30:00.000Z",repeatInterval:"daily"
    }).expect(201);
    const id=created.body.id;
    const first=await agent.post("/api/tasks/"+id+"/toggle").expect(200);
    expect(first.body).toMatchObject({id,isCompleted:true,checkinCount:1,scheduledCount:6});
    const rows=dependencies.db.prepare("SELECT id FROM tasks WHERE title=?").all("每日复习");
    expect(rows).toHaveLength(1);
    const undone=await agent.post("/api/tasks/"+id+"/toggle").expect(200);
    expect(undone.body).toMatchObject({id,isCompleted:false,checkinCount:0});
    await agent.post("/api/tasks/"+id+"/toggle").expect(200);
    currentTime=new Date("2026-10-26T04:00:00.000Z");
    const next=await agent.get("/api/tasks?scope=inbox").expect(200);
    const record=next.body.find((x:{id:string})=>x.id===id);
    expect(record).toMatchObject({id,isCompleted:false,checkinCount:1,scheduledCount:7});
  });

  test("projects and child tasks can repeat independently without cloning their checklist", async () => {
    const root=await agent.post("/api/tasks").send({
      title:"每月对账项目",dueAt:"2026-10-25T01:30:00.000Z",repeatInterval:"monthly"
    }).expect(201);
    const child=await agent.post("/api/tasks").send({
      title:"检查公积金",parentTaskId:root.body.id
    }).expect(201);
    const repeated=await agent.patch("/api/tasks/"+child.body.id).send({
      repeatInterval:"weekly",dueAt:"2026-10-25T01:30:00.000Z"
    }).expect(200);
    expect(repeated.body.repeatInterval).toBe("weekly");
    await agent.post("/api/tasks/"+child.body.id+"/toggle").expect(200);
    await agent.post("/api/tasks/"+root.body.id+"/toggle").expect(200);
    const projects=dependencies.db.prepare("SELECT id FROM tasks WHERE title=?").all("每月对账项目");
    expect(projects).toHaveLength(1);
    const record=await agent.get("/api/tasks?scope=inbox").expect(200);
    const item=record.body.find((x:{id:string})=>x.id===root.body.id);
    expect(item).toMatchObject({id:root.body.id,isCompleted:true,checkinCount:1});
    expect(item.subtasks).toHaveLength(1);
    expect(item.subtasks[0]).toMatchObject({id:child.body.id,isCompleted:true,checkinCount:1});
  });

  test("rejects an unsupported custom recurrence rule", async () => {
    const response = await agent
      .post("/api/tasks")
      .send({ title: "无效重复", repeatInterval: "custom", repeatRule: "隔一天" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: { code: "INVALID_REPEAT_RULE", message: "自定义重复只支持每周X或每月N日" } });
  });
});
