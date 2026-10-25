import { SqliteError } from "better-sqlite3";
import { Router } from "express";
import { z } from "zod";

import type { AppDependencies } from "../app";
import { createContextRepository } from "../repositories/contextRepository";

const colorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const createSchema = z.object({
  name: z.string().trim().min(1).max(40),
  icon: z.string().trim().min(1).max(40).default("folder"),
  color: colorSchema.default("#8CAABA")
});
const updateSchema = createSchema.partial().extend({ sortOrder: z.number().int().optional() });

function isUniqueViolation(error: unknown): boolean {
  return error instanceof SqliteError && error.code === "SQLITE_CONSTRAINT_UNIQUE";
}

export function createContextsRouter(dependencies: AppDependencies): Router {
  const router = Router();
  const repository = createContextRepository(dependencies.db);
  const now = () => (dependencies.now ?? (() => new Date()))();

  router.get("/", (_request, response) => {
    response.json(repository.list());
  });

  router.post("/", (request, response) => {
    const parsed = createSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: { code: "INVALID_REQUEST", message: "情境信息不完整" } });
      return;
    }
    try {
      response.status(201).json(repository.create(parsed.data, now()));
    } catch (error) {
      if (isUniqueViolation(error)) {
        response.status(409).json({ error: { code: "CONTEXT_EXISTS", message: "已有同名情境" } });
        return;
      }
      throw error;
    }
  });

  router.patch("/:id", (request, response) => {
    const parsed = updateSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: { code: "INVALID_REQUEST", message: "情境信息无效" } });
      return;
    }
    try {
      const context = repository.update(request.params.id, parsed.data, now());
      if (!context) {
        response.status(404).json({ error: { code: "NOT_FOUND", message: "情境不存在" } });
        return;
      }
      response.json(context);
    } catch (error) {
      if (isUniqueViolation(error)) {
        response.status(409).json({ error: { code: "CONTEXT_EXISTS", message: "已有同名情境" } });
        return;
      }
      throw error;
    }
  });

  router.delete("/:id", (request, response) => {
    if (!repository.remove(request.params.id)) {
      response.status(404).json({ error: { code: "NOT_FOUND", message: "情境不存在" } });
      return;
    }
    response.status(204).end();
  });

  return router;
}
