import { afterEach, describe, expect, test, vi } from "vitest";

import { createArkClient } from "../src/ai/arkClient";

const validResponse = {
  choices: [
    {
      message: {
        content: JSON.stringify({
          reply: "给你列好了",
          suggestions: [
            {
              title: "确认航班",
              category: "行程安排",
              note: "核对起飞时间",
              context: "欧洲旅行",
              priority: "high"
            }
          ],
          options: []
        })
      }
    }
  ]
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Ark client", () => {
  test("sends the configured endpoint, model, authorization, limits, and only the last six history turns", async () => {
    const fetchImpl = vi.fn(async (_input: string | URL | Request, _init?: RequestInit) =>
      new Response(JSON.stringify(validResponse), {
        status: 200,
        headers: { "content-type": "application/json" }
      })
    );
    const client = createArkClient({
      apiKey: "server-only-secret",
      endpoint: "https://ark.example.test/chat/completions",
      model: "ark-test-model",
      fetchImpl
    });

    const history = Array.from({ length: 8 }, (_, index) => ({
      role: index % 2 === 0 ? ("user" as const) : ("assistant" as const),
      content: `message-${index + 1}`
    }));
    const result = await client.requestPlan(history);

    expect(result.suggestions[0]?.title).toBe("确认航班");
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe("https://ark.example.test/chat/completions");
    expect(init?.headers).toMatchObject({
      Authorization: "Bearer server-only-secret",
      "Content-Type": "application/json"
    });
    const body = JSON.parse(String(init?.body));
    expect(body).toMatchObject({ model: "ark-test-model", temperature: 0.35, max_tokens: 4000 });
    expect(body.messages[0].role).toBe("system");
    expect(body.messages.slice(1).map((turn: { content: string }) => turn.content)).toEqual([
      "message-3",
      "message-4",
      "message-5",
      "message-6",
      "message-7",
      "message-8"
    ]);
  });

  test("uses a 35 second abort signal and never logs the API key on failure", async () => {
    const signal = new AbortController().signal;
    const timeout = vi.spyOn(AbortSignal, "timeout").mockReturnValue(signal);
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const fetchImpl = vi.fn(async (_input: string | URL | Request, _init?: RequestInit) =>
      new Response("upstream failed", { status: 503 })
    );
    const client = createArkClient({ apiKey: "never-print-this-key", fetchImpl });

    await expect(client.requestPlan([{ role: "user", content: "拆一下旅行计划" }])).rejects.toThrow(
      "AI 服务暂时不可用"
    );

    expect(timeout).toHaveBeenCalledWith(35_000);
    expect(fetchImpl.mock.calls[0]?.[1]?.signal).toBe(signal);
    expect(JSON.stringify([...log.mock.calls, ...error.mock.calls])).not.toContain("never-print-this-key");
  });
});
