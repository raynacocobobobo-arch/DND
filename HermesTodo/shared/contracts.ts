import { z } from "zod";

export const prioritySchema = z.enum(["high", "medium", "low"]);
export type Priority = z.infer<typeof prioritySchema>;

export const repeatIntervalSchema = z.enum(["none", "daily", "weekly", "monthly", "yearly", "custom"]);
export type RepeatInterval = z.infer<typeof repeatIntervalSchema>;

export const contextSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(40),
  icon: z.string().min(1).max(40),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  sortOrder: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string()
});
export type Context = z.infer<typeof contextSchema>;

export const taskSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1).max(200),
  notes: z.string().max(4000),
  priority: prioritySchema,
  dueAt: z.string().nullable(),
  isCompleted: z.boolean(),
  completedAt: z.string().nullable(),
  contextId: z.string().nullable(),
  parentTaskId: z.string().nullable(),
  repeatInterval: repeatIntervalSchema,
  repeatRule: z.string().max(100),
  createdAt: z.string(),
  updatedAt: z.string()
});
export type Task = z.infer<typeof taskSchema>;

export const aiSuggestionSchema = z.object({
  title: z.string().trim().min(1).max(12),
  category: z.string().trim().max(18).default("待办清单"),
  note: z.string().trim().max(100).default(""),
  context: z.string().trim().min(1).max(40),
  priority: prioritySchema.default("medium")
});
export type AISuggestion = z.infer<typeof aiSuggestionSchema>;

export const aiPlanResultSchema = z.object({
  reply: z.string().default(""),
  suggestions: z.array(aiSuggestionSchema).default([]),
  options: z.array(z.string().trim().min(1).max(40)).default([])
});
export type AIPlanResult = z.infer<typeof aiPlanResultSchema>;

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string()
  })
});
export type ApiError = z.infer<typeof apiErrorSchema>;
