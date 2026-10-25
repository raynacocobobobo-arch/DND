// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import { App } from "../src/App";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function suggestion(title: string, context = "欧洲旅行") {
  return { title, category: "核心事项", note: `${title}的详细备注`, context, priority: "medium" };
}

function aiFetch(handler: (path: string, init?: RequestInit) => Promise<Response> | Response) {
  return vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const path = String(input);
    if (path === "/api/session") return jsonResponse({ authenticated: true });
    return handler(path, init);
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("AI planner page", () => {
  test("shows the empty state, user and assistant turns, and sends clicked options", async () => {
    window.history.replaceState({}, "", "/ai");
    const replies = [
      { reply: "你想拆哪块？", suggestions: [], options: ["行程安排", "打包清单"] },
      { reply: "给你列好了", suggestions: [suggestion("确认航班")], options: [] }
    ];
    const fetchMock = aiFetch((path) => {
      if (path === "/api/ai/plan") return jsonResponse(replies.shift());
      throw new Error(`Unexpected request: ${path}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByText("说个目标，我来帮你拆成小步。")) .toBeInTheDocument();
    await user.type(screen.getByLabelText("告诉 AI 你的目标"), "帮我安排旅行");
    await user.click(screen.getByRole("button", { name: "发送" }));
    expect(await screen.findByText("你想拆哪块？")).toBeInTheDocument();
    expect(screen.getByText("帮我安排旅行")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "行程安排" }));
    expect(await screen.findByText("给你列好了")).toBeInTheDocument();
    expect(screen.getByText("确认航班")).toBeInTheDocument();
    const planCalls = fetchMock.mock.calls.filter(([path]) => path === "/api/ai/plan");
    const secondBody = JSON.parse(String(planCalls[1]?.[1]?.body));
    expect(secondBody.messages.at(-1)).toEqual({ role: "user", content: "行程安排" });
  });

  test("disables the composer while a plan is loading", async () => {
    window.history.replaceState({}, "", "/ai");
    let resolvePlan!: (response: Response) => void;
    const pending = new Promise<Response>((resolve) => { resolvePlan = resolve; });
    const fetchMock = aiFetch((path) => {
      if (path === "/api/ai/plan") return pending;
      throw new Error(`Unexpected request: ${path}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<App />);

    await user.type(await screen.findByLabelText("告诉 AI 你的目标"), "准备出差");
    await user.click(screen.getByRole("button", { name: "发送" }));
    expect(screen.getByLabelText("告诉 AI 你的目标")).toBeDisabled();
    expect(screen.getByRole("button", { name: "规划中…" })).toBeDisabled();
    resolvePlan(jsonResponse({ reply: "完成", suggestions: [], options: [] }));
    expect(await screen.findByText("完成")).toBeInTheDocument();
  });

  test("accumulates deduplicated suggestions in one context and commits them together", async () => {
    window.history.replaceState({}, "", "/ai");
    const replies = [
      { reply: "第一批", suggestions: [suggestion("身份证")], options: [] },
      { reply: "第二批", suggestions: [suggestion("身份证！", "另一个名字"), suggestion("护照", "另一个名字")], options: [] }
    ];
    const fetchMock = aiFetch((path, init) => {
      if (path === "/api/ai/plan") return jsonResponse(replies.shift());
      if (path === "/api/ai/commit-suggestions" && init?.method === "POST") {
        return jsonResponse({ context: { id: "travel" }, createdTasks: [{}, {}], skippedCount: 0 }, 201);
      }
      throw new Error(`Unexpected request: ${path}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<App />);

    const input = await screen.findByLabelText("告诉 AI 你的目标");
    await user.type(input, "列证件");
    await user.click(screen.getByRole("button", { name: "发送" }));
    await screen.findByText("第一批");
    await user.type(input, "再补充");
    await user.click(screen.getByRole("button", { name: "发送" }));
    await screen.findByText("第二批");

    expect(screen.getAllByTestId("ai-suggestion")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "汇总成待办" }));
    expect(await screen.findByText("已写入 2 个待办")).toBeInTheDocument();
    const commit = fetchMock.mock.calls.find(([path]) => path === "/api/ai/commit-suggestions");
    const body = JSON.parse(String(commit?.[1]?.body));
    expect(body.suggestions.map((item: { title: string }) => item.title)).toEqual(["身份证", "护照"]);
    expect(new Set(body.suggestions.map((item: { context: string }) => item.context))).toEqual(new Set(["欧洲旅行"]));
  });

  test("imports a long list, shows the fallback reply, and clears the ephemeral conversation", async () => {
    window.history.replaceState({}, "", "/ai");
    const fetchMock = aiFetch((path) => {
      if (path === "/api/ai/import-list") {
        return jsonResponse({ reply: "已按原文生成待办", suggestions: [suggestion("充电器", "出差")], options: [] });
      }
      throw new Error(`Unexpected request: ${path}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole("button", { name: "导入长清单" }));
    await user.type(screen.getByLabelText("情境名称（可选）"), "出差");
    await user.type(screen.getByLabelText("粘贴清单"), "第一章：电子设备\n充电器 | 2个 | 放随身包");
    await user.click(screen.getByRole("button", { name: "解析清单" }));

    expect(await screen.findByText("已按原文生成待办")).toBeInTheDocument();
    expect(screen.getByText("充电器")).toBeInTheDocument();
    const importCall = fetchMock.mock.calls.find(([path]) => path === "/api/ai/import-list");
    expect(JSON.parse(String(importCall?.[1]?.body))).toMatchObject({ contextHint: "出差" });

    await user.click(screen.getByRole("button", { name: "清空对话" }));
    expect(screen.getByText("说个目标，我来帮你拆成小步。")).toBeInTheDocument();
    expect(screen.queryByText("充电器")).not.toBeInTheDocument();
  });
});
