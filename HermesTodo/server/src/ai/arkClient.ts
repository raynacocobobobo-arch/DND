import type { AIPlanResult } from "../../../shared/contracts";
import { parseImportedListLocally } from "./importFallback";
import { jsonRepairSystemPrompt, taskPlanningSystemPrompt } from "./prompt";
import { AIResponseFormatError, parsePlanResponse } from "./responseParser";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

interface ArkClientOptions {
  apiKey: string;
  endpoint?: string;
  model?: string;
  fetchImpl?: typeof fetch;
}

const defaultEndpoint = "https://ark.cn-beijing.volces.com/api/coding/v3/chat/completions";
const defaultModel = "ark-code-latest";

export function createArkClient(options: ArkClientOptions) {
  const endpoint = options.endpoint ?? defaultEndpoint;
  const model = options.model ?? defaultModel;
  const fetchImpl = options.fetchImpl ?? fetch;

  async function complete(
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    repair = false
  ): Promise<string> {
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: repair ? 0.3 : 0.35,
        max_tokens: repair ? 2000 : 4000
      }),
      signal: AbortSignal.timeout(35_000)
    });
    if (!response.ok) {
      throw new Error("AI 服务暂时不可用");
    }
    const payload = (await response.json()) as { choices?: Array<{ message?: { content?: unknown } }> };
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      throw new Error("AI 服务暂时不可用");
    }
    return content;
  }

  async function requestPlan(
    history: ChatTurn[],
    fallback?: { raw: string; contextHint?: string }
  ): Promise<AIPlanResult> {
    const messages = [
      { role: "system" as const, content: taskPlanningSystemPrompt },
      ...history.slice(-6)
    ];
    const raw = await complete(messages);
    try {
      return parsePlanResponse(raw);
    } catch (error) {
      if (!(error instanceof AIResponseFormatError)) {
        throw error;
      }
      const repaired = await complete(
        [
          { role: "system", content: jsonRepairSystemPrompt },
          { role: "user", content: raw }
        ],
        true
      );
      try {
        return parsePlanResponse(repaired);
      } catch (repairError) {
        if (!(repairError instanceof AIResponseFormatError) || !fallback) {
          throw repairError;
        }
        const suggestions = parseImportedListLocally(fallback.raw, fallback.contextHint);
        if (suggestions.length === 0) {
          throw repairError;
        }
        return { reply: "已按原文生成待办", suggestions, options: [] };
      }
    }
  }

  return { requestPlan };
}
