import { SqliteError } from "better-sqlite3";
import { Router } from "express";
import { z } from "zod";

import type { AppDependencies } from "../app";
import { prioritySchema, repeatIntervalSchema } from "../../../shared/contracts";
import { isValidCustomRepeatRule } from "../domain/recurrence";
import { createTaskRepository, SubtaskDepthError } from "../repositories/taskRepository";

const nullableId = z.string().min(1).nullable();
const createSchema = z.object({
  title: z.string().trim().min(1).max(200),
  notes: z.string().max(4000).default(""),
  priority: prioritySchema.default("medium"),
  dueAt: z.string().datetime({ offset: true }).nullable().default(null),
  contextId: nullableId.default(null),
  parentTaskId: nullableId.default(null),
  repeatInterval: repeatIntervalSchema.default("none"),
  repeatRule: z.string().max(100).default("")
});
const updateSchema = createSchema.omit({ parentTaskId: true }).partial();
const listSchema = z.object({
  search: z.string().max(200).optional(),
  contextId: z.string().min(1).optional(),
  scope: z.enum(["inbox"]).optional(),
  sort: z.enum(["priority", "dueDate", "createdAt"]).default("priority")
});

function hasValidRepeatRule(value: { repeatInterval?: string; repeatRule?: string }): boolean {
  return value.repeatInterval !== "custom" || isValidCustomRepeatRule(value.repeatRule ?? "");
}

function invalidRelation(error: unknown): boolean {
  return error instanceof SqliteError && error.code === "SQLITE_CONSTRAINT_FOREIGNKEY";
}

export function createTasksRouter(dependencies: AppDependencies): Router {
  const router = Router();
  const repository = createTaskRepository(dependencies.db);
  const now = () => (dependencies.now ?? (() => new Date()))();

  router.get("/", (request, response) => {
    const parsed = listSchema.safeParse(request.query);
    if (!parsed.success || (parsed.data.scope === "inbox" && parsed.data.contextId)) {
      response.status(400).json({ error: { code: "INVALID_REQUEST", message: "筛选条件无效" } });
      return;
    }
    response.json(repository.list(parsed.data));
  });

  router.post("/", (request, response) => {
    const parsed = createSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: { code: "INVALID_REQUEST", message: "任务信息无效" } });
      return;
    }
    if (!hasValidRepeatRule(parsed.data)) {
      response.status(400).json({
        error: { code: "INVALID_REPEAT_RULE", message: "自定义重复只支持每周X或每月N日" }
      });
      return;
    }
    try {
      response.status(201).json(repository.create(parsed.data, now()));
    } catch (error) {
      if (error instanceof SubtaskDepthError) {
        response.status(400).json({ error: { code: "SUBTASK_DEPTH", message: "子任务只支持一层" } });
        return;
      }
      if (invalidRelation(error)) {
        response.status(400).json({ error: { code: "INVALID_RELATION", message: "情境或父任务不存在" } });
        return;
      }
      throw error;
    }
  });

  router.patch("/:id", (request, response) => {
    const parsed = updateSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: { code: "INVALID_REQUEST", message: "任务信息无效" } });
      return;
    }
    if (!hasValidRepeatRule(parsed.data)) {
      response.status(400).json({
        error: { code: "INVALID_REPEAT_RULE", message: "自定义重复只支持每周X或每月N日" }
      });
      return;
    }
    try {
      const task = repository.update(request.params.id, parsed.data, now());
      if (!task) {
        response.status(404).json({ error: { code: "NOT_FOUND", message: "任务不存在" } });
        return;
      }
      response.json(task);
    } catch (error) {
      if (invalidRelation(error)) {
        response.status(400).json({ error: { code: "INVALID_RELATION", message: "情境不存在" } });
        return;
      }
      throw error;
    }
  });

  router.post("/:id/toggle", (request, response) => {
    const task = repository.toggle(request.params.id, now());
    if (!task) {
      response.status(404).json({ error: { code: "NOT_FOUND", message: "任务不存在" } });
      return;
    }
    response.json(task);
  });

  router.delete("/:id", (request, response) => {
    if (!repository.remove(request.params.id)) {
      response.status(404).json({ error: { code: "NOT_FOUND", message: "任务不存在" } });
      return;
    }
    response.status(204).end();
  });

  return router;
}
