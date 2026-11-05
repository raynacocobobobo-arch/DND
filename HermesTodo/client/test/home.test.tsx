// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { App } from "../src/App";
import { queryClient } from "../src/api/queryClient";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status, headers: status === 204 ? undefined : { "content-type": "application/json" }
  });
}

const baseTask = {
  notes: "", priority: "medium" as const, completedAt: null,
  contextId: null, parentTaskId: null, repeatInterval: "none" as const,
  repeatRule: "", dueAt: null, isCompleted: false,
  createdAt: "2026-11-05T01:00:00.000Z", updatedAt: "2026-11-05T01:00:00.000Z",
  subtasks: []
};
const context = {
  id: "travel-id", name: "旅行", icon: "suitcase", color: "#EEB0A8",
  sortOrder: 0, incompleteCount: 2,
  createdAt: "2026-10-01T00:00:00.000Z", updatedAt: "2026-10-01T00:00:00.000Z"
};
function apiMock(initial: Array<Record<string, unknown>>) {
  const rows = [...initial];
  const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const path = String(input);
    const method = init?.method ?? "GET";
    if (path === "/api/session") return jsonResponse({ authenticated: true });
    if (path === "/api/contexts") return jsonResponse([context]);
    if (path.startsWith("/api/tasks?") && method === "GET") return jsonResponse(rows);
    if (path === "/api/tasks" && method === "POST") {
      const body = JSON.parse(String(init?.body));
      rows.push({ ...baseTask, ...body, id: "new-task" });
      return jsonResponse(rows.at(-1), 201);
    }
    if (/^\/api\/tasks\/[^/]+\/toggle$/.test(path) && method === "POST") {
      const id = path.split("/")[3];
      const task = rows.find((row) => row.id === id);
      if (!task) return jsonResponse({error:{code:"NOT_FOUND",message:"未找到"}},404);
      task.isCompleted = !task.isCompleted;
      task.completedAt = task.isCompleted ? "2026-11-05T08:00:00.000Z" : null;
      return jsonResponse(task);
    }
    throw new Error("Unexpected request: " + method + " " + path);
  });
  return fetchMock;
}

beforeEach(() => {
  window.history.replaceState({}, "", "/inbox");
  queryClient.clear();
});
afterEach(() => {
  queryClient.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("task activity timeline", () => {
  test("groups incomplete tasks by date and includes tasks inside scenes", async () => {
    vi.stubGlobal("fetch", apiMock([
      { ...baseTask, id:"today", title:"今天完成", dueAt:"2026-11-05T04:00:00.000Z" },
      { ...baseTask, id:"late", title:"已经逾期", dueAt:"2026-11-04T04:00:00.000Z" },
      { ...baseTask, id:"context", title:"确认航班", contextId:context.id },
      { ...baseTask, id:"done", title:"已经完成", isCompleted:true, completedAt:"2026-11-05T06:00:00.000Z" }
    ]));
    render(<App />);
    expect(await screen.findByRole("heading", {name:"待办记录时间线"})).toBeInTheDocument();
    expect(await screen.findByRole("button", {name:"确认航班"})).toBeInTheDocument();
    expect(screen.getByRole("button", {name:"已经逾期"})).toBeInTheDocument();
    expect(screen.queryByRole("button", {name:"已经完成"})).not.toBeInTheDocument();
    expect(screen.getByRole("heading", {name:/11月5日/})).toBeInTheDocument();
  });

  test("filters completed records without deleting task history", async () => {
    vi.stubGlobal("fetch", apiMock([
      { ...baseTask, id:"active", title:"未完成任务" },
      { ...baseTask, id:"done", title:"已完成任务", isCompleted:true, completedAt:"2026-11-05T06:00:00.000Z" }
    ]));
    const user = userEvent.setup();
    render(<App />);
    expect(await screen.findByRole("button", {name:"未完成任务"})).toBeInTheDocument();
    await user.click(screen.getByRole("button", {name:"已完成"}));
    expect(await screen.findByRole("button", {name:"已完成任务"})).toBeInTheDocument();
    expect(screen.queryByRole("button", {name:"未完成任务"})).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", {name:"全部记录"}));
    expect(await screen.findByRole("button", {name:"未完成任务"})).toBeInTheDocument();
  });

  test("shows recurrence metadata and opens task editor", async () => {
    vi.stubGlobal("fetch", apiMock([
      { ...baseTask, id:"repeating", title:"检查公积金", dueAt:"2026-11-22T01:00:00.000Z",
        repeatInterval:"custom", repeatRule:"每月22日" }
    ]));
    const user = userEvent.setup();
    render(<App />);
    expect(await screen.findByText(/每月22日/)).toBeInTheDocument();
    await user.click(screen.getByRole("button",{name:"检查公积金"}));
    expect(await screen.findByRole("dialog",{name:"任务详情"})).toBeInTheDocument();
    expect(screen.getByDisplayValue("每月22日")).toBeInTheDocument();
  });

  test("marks a task completed and moves it into its completion date", async () => {
    const fetchMock = apiMock([{...baseTask,id:"toggle",title:"对公账户"}]);
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole("button",{name:"完成 对公账户"}));
    await waitFor(() => expect(fetchMock.mock.calls.some(([input,init]) =>
      String(input)==="/api/tasks/toggle/toggle" && init?.method==="POST")).toBe(true));
    await user.click(screen.getByRole("button",{name:"已完成"}));
    expect(await screen.findByRole("button",{name:"对公账户"})).toBeInTheDocument();
  });

  test("creates a dated recurring task through the editor", async () => {
    const fetchMock=apiMock([]);
    vi.stubGlobal("fetch",fetchMock);
    const user=userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole("button",{name:/新建任务/}));
    expect(await screen.findByRole("dialog",{name:"新建任务"})).toBeInTheDocument();
    await user.type(screen.getByLabelText("任务标题"),"每月检查账单");
    await user.type(screen.getByLabelText("截止日期"),"2026-11-22");
    await user.click(screen.getByText("更多选项",{exact:false}));
    await user.selectOptions(screen.getByLabelText("重复"),"monthly");
    await user.click(screen.getByRole("button",{name:"保存任务"}));
    await waitFor(() => {
      const call=fetchMock.mock.calls.find(([input,init])=>String(input)==="/api/tasks"&&init?.method==="POST");
      expect(call).toBeTruthy();
      const body=JSON.parse(String(call?.[1]?.body));
      expect(body.repeatInterval).toBe("monthly");
      expect(body.dueAt).toBe("2026-11-22T01:00:00.000Z");
    });
  });
});
