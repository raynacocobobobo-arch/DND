import { Router } from "express";
import { z } from "zod";

import type { AppDependencies } from "../app";
import { parseImportedListLocally } from "../ai/importFallback";
import { aiSuggestionSchema } from "../../../shared/contracts";
import { normalizeAITaskTitle, normalizeContextName } from "../domain/normalization";
import { createContextRepository } from "../repositories/contextRepository";
import { createTaskRepository } from "../repositories/taskRepository";

const chatTurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(20_000)
});
const planSchema = z.object({ messages: z.array(chatTurnSchema).min(1).max(50) });
const importSchema = z.object({
  raw: z.string().trim().min(1).max(100_000),
  contextHint: z.string().trim().max(40).default(""),
  messages: z.array(chatTurnSchema).max(50).optional()
});
const commitSchema = z.object({ suggestions: z.array(aiSuggestionSchema).min(1).max(500) });

const contextColors = ["#EEB0A8", "#DEC880", "#B1C8A5", "#A2BCC8", "#C89870"];

function iconForContext(name: string): string {
  if (/出差|旅行|行李/u.test(name)) return "suitcase";
  if (/拍|视频|婚礼/u.test(name)) return "video";
  if (/工作|项目|客户/u.test(name)) return "briefcase";
  if (/证件|身份证|护照/u.test(name)) return "id-card";
  if (/购物|采购/u.test(name)) return "shopping-cart";
  if (/财务|账|钱/u.test(name)) return "circle-dollar-sign";
  if (/学习|读/u.test(name)) return "book-open";
  if (/健身|运动/u.test(name)) return "dumbbell";
  if (/家|生活/u.test(name)) return "house";
  return "folder";
}

export function createAIRouter(dependencies: AppDependencies): Router {
  const router = Router();
  const contexts = createContextRepository(dependencies.db);
  const tasks = createTaskRepository(dependencies.db);
  const now = () => (dependencies.now ?? (() => new Date()))();

  router.post("/plan", async (request, response) => {
    const parsed = planSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: { code: "INVALID_REQUEST", message: "对话内容无效" } });
      return;
    }
    if (!dependencies.aiPlanner) {
      response.status(503).json({ error: { code: "AI_NOT_CONFIGURED", message: "AI 服务尚未配置" } });
      return;
    }
    try {
      response.json(await dependencies.aiPlanner.requestPlan(parsed.data.messages));
    } catch {
      response.status(502).json({ error: { code: "AI_UNAVAILABLE", message: "AI 服务暂时不可用" } });
    }
  });

  router.post("/import-list", async (request, response) => {
    const parsed = importSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: { code: "INVALID_REQUEST", message: "导入内容无效" } });
      return;
    }
    const messages = parsed.data.messages?.length
      ? parsed.data.messages
      : [{ role: "user" as const, content: parsed.data.raw }];
    if (!dependencies.aiPlanner) {
      const suggestions = parseImportedListLocally(parsed.data.raw, parsed.data.contextHint);
      response.json({ reply: "已按原文生成待办", suggestions, options: [] });
      return;
    }
    try {
      response.json(
        await dependencies.aiPlanner.requestPlan(messages, {
          raw: parsed.data.raw,
          contextHint: parsed.data.contextHint
        })
      );
    } catch {
      response.status(502).json({ error: { code: "AI_UNAVAILABLE", message: "AI 服务暂时不可用" } });
    }
  });

  router.post("/commit-suggestions", (request, response) => {
    const parsed = commitSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: { code: "INVALID_REQUEST", message: "AI 待办内容无效" } });
      return;
    }

    const normalizedContexts = new Set(
      parsed.data.suggestions.map((suggestion) => normalizeContextName(suggestion.context))
    );
    if (normalizedContexts.size !== 1) {
      response.status(400).json({ error: { code: "MIXED_CONTEXTS", message: "一次只能写入一个情境" } });
      return;
    }

    const result = dependencies.db.transaction(() => {
      const contextName = parsed.data.suggestions[0]!.context.trim();
      const normalizedName = normalizeContextName(contextName);
      const existing = dependencies.db
        .prepare("SELECT id FROM contexts WHERE normalized_name = ?")
        .get(normalizedName) as { id: string } | undefined;
      const context = existing
        ? contexts.find(existing.id)!
        : contexts.create(
            {
              name: contextName,
              icon: iconForContext(contextName),
              color: contextColors[contexts.list().length % contextColors.length]!
            },
            now()
          );

      const rows = dependencies.db
        .prepare("SELECT title FROM tasks WHERE context_id = ? AND parent_task_id IS NULL")
        .all(context.id) as Array<{ title: string }>;
      const seen = new Set(rows.map((row) => normalizeAITaskTitle(row.title)));
      const createdTasks = [];
      let skippedCount = 0;
      for (const suggestion of parsed.data.suggestions) {
        const key = normalizeAITaskTitle(suggestion.title);
        if (seen.has(key)) {
          skippedCount += 1;
          continue;
        }
        const notes = [suggestion.category ? `【${suggestion.category}】` : "", suggestion.note]
          .filter(Boolean)
          .join("\n");
        createdTasks.push(
          tasks.create(
            {
              title: suggestion.title,
              notes,
              priority: suggestion.priority,
              contextId: context.id
            },
            now()
          )
        );
        seen.add(key);
      }
      return { context, createdTasks, skippedCount };
    })();

    response.status(201).json(result);
  });

  return router;
}
