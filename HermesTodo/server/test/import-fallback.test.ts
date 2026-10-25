import { describe, expect, test, vi } from "vitest";

import { createArkClient } from "../src/ai/arkClient";
import { parseImportedListLocally } from "../src/ai/importFallback";

function arkResponse(content: string): Response {
  return new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
    status: 200,
    headers: { "content-type": "application/json" }
  });
}

const importedText = `
第一章：核心证件
为什么这些证件很重要？
护照 | 原件1本、复印件2份 | 有效期至少6个月
充电器，放随身包，带2个

第二章：旅途用品
颈枕 | 夜间航班使用
`;

describe("local imported-list fallback", () => {
  test("excludes structural and explanation headings while retaining quantities, conditions, and notes", () => {
    const suggestions = parseImportedListLocally(importedText, "欧洲旅行");

    expect(suggestions.map((item) => item.title)).toEqual(["护照", "充电器", "颈枕"]);
    expect(suggestions[0]).toMatchObject({
      category: "核心证件",
      note: "原件1本、复印件2份；有效期至少6个月",
      context: "欧洲旅行",
      priority: "medium"
    });
    expect(suggestions[1]).toMatchObject({
      title: "充电器",
      category: "核心证件",
      note: "充电器，放随身包，带2个"
    });
    expect(suggestions[2]).toMatchObject({ category: "旅途用品", note: "夜间航班使用" });
  });

  test("does not split a descriptive line on Chinese or English commas", () => {
    const suggestions = parseImportedListLocally("雨伞，遇到阵雨时使用, 放在侧袋", "出差");

    expect(suggestions).toHaveLength(1);
    expect(suggestions[0]).toMatchObject({
      title: "雨伞",
      note: "雨伞，遇到阵雨时使用, 放在侧袋"
    });
  });

  test("falls back to local parsing only after the repair response is also invalid", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(arkResponse("第一次不是 JSON"))
      .mockResolvedValueOnce(arkResponse("第二次也不是 JSON"));
    const client = createArkClient({ apiKey: "secret", fetchImpl });

    const result = await client.requestPlan(
      [{ role: "user", content: importedText }],
      { raw: importedText, contextHint: "欧洲旅行" }
    );

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(result.reply).toBe("已按原文生成待办");
    expect(result.suggestions.map((item) => item.title)).toEqual(["护照", "充电器", "颈枕"]);
  });
});
