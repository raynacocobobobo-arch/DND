import { aiPlanResultSchema, type AIPlanResult, type AISuggestion } from "../../../shared/contracts";

export class AIResponseFormatError extends Error {}

function truncate(value: string, maxLength: number): string {
  return Array.from(value).slice(0, maxLength).join("");
}

function cleanTitle(value: string): string {
  let title = value
    .normalize("NFKC")
    .trim()
    .replace(/^[0-9一二三四五六七八九十]+[、.．)）\-\s]+/u, "");
  for (const word of ["建议", "确保", "避免", "提前", "记得", "检查", "确认一下", "最好", "需要", "把", "放在", "放到"]) {
    title = title.replaceAll(word, "");
  }
  title = title.replace(/（.*?）|\(.*?\)/gu, "");
  title = title.split(/[,，。.：:]/u, 1)[0]?.trim() ?? "";
  return truncate(title, 12);
}

function cleanSuggestion(value: Record<string, unknown>): AISuggestion {
  const rawPriority = String(value.priority ?? "medium").toLowerCase();
  const priority = rawPriority.includes("high") || rawPriority.includes("高")
    ? "high"
    : rawPriority.includes("low") || rawPriority.includes("低")
      ? "low"
      : "medium";
  return {
    title: cleanTitle(String(value.title ?? "")),
    category: truncate(String(value.category ?? "待办清单").trim() || "待办清单", 18),
    note: truncate(String(value.note ?? "").trim().replace(/\s+/gu, " "), 100),
    context: truncate(String(value.context ?? "").trim(), 40),
    priority
  };
}

export function parsePlanResponse(raw: string): AIPlanResult {
  const withoutFence = raw
    .trim()
    .replace(/^```(?:json)?\s*/iu, "")
    .replace(/\s*```$/u, "")
    .trim();

  try {
    const decoded = JSON.parse(withoutFence) as Record<string, unknown>;
    const suggestions = Array.isArray(decoded.suggestions)
      ? decoded.suggestions.map((value) => cleanSuggestion(value as Record<string, unknown>))
      : [];
    const conversationContext = suggestions.find((suggestion) => suggestion.context)?.context;
    const unifiedSuggestions = conversationContext
      ? suggestions.map((suggestion) => ({ ...suggestion, context: conversationContext }))
      : suggestions;
    return aiPlanResultSchema.parse({
      reply: typeof decoded.reply === "string" ? decoded.reply : "",
      suggestions: unifiedSuggestions,
      options: Array.isArray(decoded.options) ? decoded.options : []
    });
  } catch {
    throw new AIResponseFormatError("AI 返回格式无效");
  }
}
