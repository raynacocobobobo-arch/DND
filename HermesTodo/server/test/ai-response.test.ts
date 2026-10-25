import { describe, expect, test, vi } from "vitest";

import { createArkClient } from "../src/ai/arkClient";
import { parsePlanResponse } from "../src/ai/responseParser";

function arkResponse(content: string): Response {
  return new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
    status: 200,
    headers: { "content-type": "application/json" }
  });
}

describe("AI response parsing", () => {
  test("accepts JSON code fences and cleans constrained suggestion fields", () => {
    const result = parsePlanResponse(`\`\`\`json
      {
        "reply": "给你列好了",
        "suggestions": [{
          "title": "1、提前检查护照（放在随身包），避免忘记",
          "category": "核心证件与财务安排非常非常非常非常非常长",
          "note": "  有效期至少 6 个月，原件 1 本。  ",
          "context": "欧洲旅行清单",
          "priority": "高"
        }],
        "options": []
      }
    \`\`\``);

    expect(result).toEqual({
      reply: "给你列好了",
      suggestions: [
        {
          title: "护照",
          category: "核心证件与财务安排非常非常非常非常非",
          note: "有效期至少 6 个月，原件 1 本。",
          context: "欧洲旅行清单",
          priority: "high"
        }
      ],
      options: []
    });
    expect(Array.from(result.suggestions[0]!.category)).toHaveLength(18);
  });

  test("forces every suggestion in one response into the first context", () => {
    const result = parsePlanResponse(
      JSON.stringify({
        reply: "完成",
        suggestions: [
          { title: "订酒店", context: "欧洲旅行", priority: "high" },
          { title: "打印行程单", context: "其他情境", priority: "medium" }
        ],
        options: []
      })
    );

    expect(result.suggestions.map((item) => item.context)).toEqual(["欧洲旅行", "欧洲旅行"]);
  });

  test("retries malformed output once with the JSON-only repair prompt", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(arkResponse("不是 JSON"))
      .mockResolvedValueOnce(
        arkResponse(
          JSON.stringify({
            reply: "已修复",
            suggestions: [{ title: "订酒店", context: "旅行", priority: "medium" }],
            options: []
          })
        )
      );
    const client = createArkClient({ apiKey: "secret", fetchImpl });

    const result = await client.requestPlan([{ role: "user", content: "安排旅行" }]);

    expect(result.reply).toBe("已修复");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    const repairBody = JSON.parse(String(fetchImpl.mock.calls[1]?.[1]?.body));
    expect(repairBody).toMatchObject({ temperature: 0.3, max_tokens: 2000 });
    expect(repairBody.messages[0]).toEqual({ role: "system", content: "你只输出JSON。" });
  });
});
