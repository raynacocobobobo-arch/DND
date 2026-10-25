// @vitest-environment jsdom

import { formatInTimeZone } from "date-fns-tz";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import { App } from "../src/App";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: status === 204 ? undefined : { "content-type": "application/json" }
  });
}

const context = {
  id: "travel-id",
  name: "旅行",
  icon: "suitcase",
  color: "#EEB0A8",
  sortOrder: 0,
  incompleteCount: 2,
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z"
};

const baseTask = {
  notes: "",
  priority: "medium" as const,
  completedAt: null,
  contextId: null,
  parentTaskId: null,
  repeatInterval: "none" as const,
  repeatRule: "",
  createdAt: "2026-10-20T00:00:00.000Z",
  updatedAt: "2026-10-20T00:00:00.000Z",
  subtasks: []
};

function createFetch(tasks: Array<Record<string, unknown>>) {
  return vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const path = String(input);
    if (path === "/api/session") return jsonResponse({ authenticated: true });
    if (path === "/api/contexts") return jsonResponse([context]);
    if (path.startsWith("/api/tasks") && (!init?.method || init.method === "GET")) return jsonResponse(tasks);
    throw new Error(`Unexpected request: ${init?.method ?? "GET"} ${path}`);
  });
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("home dashboard", () => {
  test("shows today, overdue, open, and completed counts", async () => {
    vi.setSystemTime(new Date("2026-10-25T08:00:00.000Z"));
    const tasks = [
      { ...baseTask, id: "today", title: "今天完成", dueAt: "2026-10-25T04:00:00.000Z", isCompleted: false },
      { ...baseTask, id: "late", title: "已经逾期", dueAt: "2026-10-24T04:00:00.000Z", isCompleted: false },
      { ...baseTask, id: "open", title: "没有日期", dueAt: null, isCompleted: false },
      { ...baseTask, id: "done", title: "已经完成", dueAt: "2026-10-25T02:00:00.000Z", isCompleted: true, completedAt: "2026-10-25T03:00:00.000Z" }
    ];
    vi.stubGlobal("fetch", createFetch(tasks));
    render(<App />);

    const summary = await screen.findByRole("region", { name: "任务概览" });
    expect(screen.getByText("10月25日 星期日")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "下午好" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "今日进度" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "今日重点" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "情境入口" })).toBeInTheDocument();
    await waitFor(() => {
      expect(within(summary).getByText("今日待办").closest("article")).toHaveTextContent("1");
      expect(within(summary).getByText("逾期").closest("article")).toHaveTextContent("1");
      expect(within(summary).getByText("已完成").closest("article")).toHaveTextContent("1");
      expect(screen.queryByText("未完成")).not.toBeInTheDocument();
      expect(screen.getByRole("progressbar")).toHaveAttribute("value", "50");
      expect(screen.getByText("今日已完成 1 / 2 件到期任务。")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "逾期待处理" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "已经逾期" })).toBeInTheDocument();
    });
  });

  test("shows every due-today task without silently dropping items after the fifth", async () => {
    vi.setSystemTime(new Date("2026-10-25T08:00:00.000Z"));
    const tasks = Array.from({ length: 7 }, (_, index) => ({
      ...baseTask, id: `task-${index}`, title: `今天任务${index + 1}`,
      dueAt: "2026-10-25T04:00:00.000Z", isCompleted: false
    }));
    vi.stubGlobal("fetch", createFetch(tasks));
    render(<App />);
    expect(await screen.findByRole("button", { name: "今天任务7" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^今天任务\d+$/ })).toHaveLength(7);
  });

  test("keeps quick-add input and reports a failed create request", async () => {
    const fetchMock = createFetch([]);
    fetchMock.mockImplementation(async (input, init) => {
      const path = String(input);
      if (path === "/api/tasks" && init?.method === "POST") {
        return jsonResponse({ error: { code: "UNAVAILABLE", message: "网络暂时不可用" } }, 503);
      }
      if (path === "/api/session") return jsonResponse({ authenticated: true });
      if (path === "/api/contexts") return jsonResponse([context]);
      if (path.startsWith("/api/tasks")) return jsonResponse([]);
      throw new Error(`Unexpected request: ${path}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<App />);
    await user.type(await screen.findByLabelText("快速添加今日任务"), "保留这条草稿");
    await user.click(screen.getByRole("button", { name: "添加" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("网络暂时不可用");
    expect(screen.getByLabelText("快速添加今日任务")).toHaveValue("保留这条草稿");
  });

  test("quick-add sends a task due today in Asia/Shanghai", async () => {
    vi.setSystemTime(new Date("2026-10-25T08:00:00.000Z"));
    const fetchMock = createFetch([]);
    fetchMock.mockImplementationOnce(async () => jsonResponse({ authenticated: true }));
    fetchMock.mockImplementationOnce(async () => jsonResponse([context]));
    fetchMock.mockImplementationOnce(async () => jsonResponse([]));
    fetchMock.mockImplementationOnce(async (_input, init) =>
      jsonResponse({ ...baseTask, id: "new", title: "买咖啡豆", dueAt: JSON.parse(String(init?.body)).dueAt, isCompleted: false }, 201)
    );
    fetchMock.mockImplementation(async (input) => String(input).startsWith("/api/tasks") ? jsonResponse([]) : jsonResponse([context]));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<App />);

    await user.type(await screen.findByLabelText("快速添加今日任务"), "买咖啡豆");
    await user.click(screen.getByRole("button", { name: "添加" }));

    await waitFor(() => {
      const call = fetchMock.mock.calls.find(([, init]) => init?.method === "POST");
      expect(call).toBeTruthy();
      const body = JSON.parse(String(call?.[1]?.body));
      expect(body.title).toBe("买咖啡豆");
      expect(formatInTimeZone(body.dueAt, "Asia/Shanghai", "yyyy-MM-dd")).toBe("2026-10-25");
    });
  });

  test("opens the full task editor from an empty home add button", async () => {
    vi.stubGlobal("fetch", createFetch([]));
    const user = userEvent.setup();
    render(<App />);

    const add = await screen.findByRole("button", { name: "添加" });
    expect(add).toBeEnabled();
    await user.click(add);
    expect(await screen.findByRole("dialog", { name: "新建任务" })).toBeInTheDocument();
    expect(screen.getByLabelText("任务标题")).toBeInTheDocument();
  });

  test("completes a task and links its context", async () => {
    vi.setSystemTime(new Date("2026-10-25T08:00:00.000Z"));
    const tasks = [
      { ...baseTask, id: "context-task", title: "确认航班", dueAt: "2026-10-25T04:00:00.000Z", isCompleted: false, contextId: context.id }
    ];
    const fetchMock = createFetch(tasks);
    fetchMock.mockImplementation(async (input, init) => {
      const path = String(input);
      if (path === "/api/session") return jsonResponse({ authenticated: true });
      if (path === "/api/contexts") return jsonResponse([context]);
      if (path === "/api/tasks/context-task/toggle" && init?.method === "POST") {
        tasks[0] = { ...tasks[0], isCompleted: true };
        return jsonResponse(tasks[0]);
      }
      if (path.startsWith("/api/tasks")) return jsonResponse(tasks);
      throw new Error(`Unexpected request: ${path}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole("button", { name: "完成 确认航班" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/tasks/context-task/toggle",
      expect.objectContaining({ method: "POST" })
    ));
    await user.click(screen.getByRole("link", { name: /旅行/ }));
    expect(window.location.pathname).toBe("/contexts/travel-id");
  });
});
