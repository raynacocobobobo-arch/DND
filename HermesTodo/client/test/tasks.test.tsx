// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import { App } from "../src/App";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: status === 204 ? undefined : { "content-type": "application/json" }
  });
}

const stamp = "2026-10-25T08:00:00.000Z";
const contexts = [
  { id: "travel-id", name: "旅行", icon: "suitcase", color: "#EEB0A8", sortOrder: 0, incompleteCount: 1, createdAt: stamp, updatedAt: stamp },
  { id: "work-id", name: "工作", icon: "briefcase", color: "#A2BCC8", sortOrder: 1, incompleteCount: 0, createdAt: stamp, updatedAt: stamp }
];

function task(overrides: Record<string, unknown> = {}) {
  return {
    id: "task-id",
    title: "确认航班",
    notes: "核对时间",
    priority: "medium",
    dueAt: "2026-10-26T01:30:00.000Z",
    isCompleted: false,
    completedAt: null,
    contextId: "travel-id",
    parentTaskId: null,
    repeatInterval: "none",
    repeatRule: "",
    createdAt: stamp,
    updatedAt: stamp,
    subtasks: [] as Array<Record<string, unknown>>,
    ...overrides
  };
}

function statefulFetch(initialTasks: Array<ReturnType<typeof task>>) {
  const tasks = initialTasks;
  const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const path = String(input);
    if (path === "/api/session") return jsonResponse({ authenticated: true });
    if (path === "/api/contexts") return jsonResponse(contexts);
    if (path.startsWith("/api/tasks") && (!init?.method || init.method === "GET")) return jsonResponse(tasks);
    if (path === "/api/tasks/child-id/toggle" && init?.method === "POST") {
      const child = tasks[0]?.subtasks[0];
      if (!child) throw new Error("Missing subtask");
      child.isCompleted = !child.isCompleted;
      return jsonResponse(child);
    }
    if (path === "/api/tasks/task-id" && init?.method === "PATCH") {
      Object.assign(tasks[0]!, JSON.parse(String(init.body)));
      return jsonResponse(tasks[0]);
    }
    if (path === "/api/tasks" && init?.method === "POST") {
      const body = JSON.parse(String(init.body));
      const created = task({ id: "child-id", ...body, contextId: null, dueAt: null, parentTaskId: body.parentTaskId });
      tasks[0]!.subtasks.push(created);
      return jsonResponse(created, 201);
    }
    if (path === "/api/tasks/task-id" && init?.method === "DELETE") {
      tasks.splice(0, 1);
      return jsonResponse(null, 204);
    }
    throw new Error(`Unexpected request: ${init?.method ?? "GET"} ${path}`);
  });
  return { fetchMock, tasks };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("task interactions", () => {
  test("edits title, note, date/time, repeat, and context without changing legacy priority", async () => {
    window.history.replaceState({}, "", "/contexts/travel-id");
    const { fetchMock } = statefulFetch([task()]);
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole("button", { name: "确认航班" }));
    expect(screen.getByRole("dialog", { name: "任务详情" })).toHaveClass("task-detail");
    const title = screen.getByLabelText("任务标题");
    await user.clear(title);
    await user.type(title, "确认返程航班");
    const notes = screen.getByLabelText("备注");
    await user.clear(notes);
    await user.type(notes, "核对登机口和时间");
    expect(screen.queryByLabelText("优先级")).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("任务归属"), "work-id");
    await user.clear(screen.getByLabelText("截止日期"));
    await user.type(screen.getByLabelText("截止日期"), "2026-11-03");
    await user.clear(screen.getByLabelText("截止时间"));
    await user.type(screen.getByLabelText("截止时间"), "14:20");
    await user.selectOptions(screen.getByLabelText("重复"), "weekly");
    await user.click(screen.getByRole("button", { name: "保存任务" }));

    await waitFor(() => {
      const patch = fetchMock.mock.calls.find(([path, init]) => path === "/api/tasks/task-id" && init?.method === "PATCH");
      const body = JSON.parse(String(patch?.[1]?.body));
      expect(body).toMatchObject({
        title: "确认返程航班",
        notes: "核对登机口和时间",
        contextId: "work-id",
        repeatInterval: "weekly"
      });
      expect(body.dueAt).toBe("2026-11-03T06:20:00.000Z");
      expect(body.priority).toBeUndefined();
    });
  });

  test("rejects an unsupported custom repeat rule before saving", async () => {
    window.history.replaceState({}, "", "/contexts/travel-id");
    const { fetchMock } = statefulFetch([task()]);
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole("button", { name: "确认航班" }));
    await user.selectOptions(screen.getByLabelText("重复"), "custom");
    await user.type(screen.getByLabelText("自定义重复"), "每小时一次");
    await user.click(screen.getByRole("button", { name: "保存任务" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("只支持“每周X”或“每月N日”");
    expect(fetchMock.mock.calls.some(([path, init]) => path === "/api/tasks/task-id" && init?.method === "PATCH")).toBe(false);
  });

  test("adds a one-level subtask and deletes the parent only after confirmation", async () => {
    window.history.replaceState({}, "", "/contexts/travel-id");
    const { fetchMock } = statefulFetch([task()]);
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole("button", { name: "确认航班" }));
    await user.type(screen.getByLabelText("新增子任务"), "下载登机牌");
    await user.click(screen.getByRole("button", { name: "添加子任务" }));
    await waitFor(() => {
      const post = fetchMock.mock.calls.find(([path, init]) => path === "/api/tasks" && init?.method === "POST");
      expect(JSON.parse(String(post?.[1]?.body))).toMatchObject({ title: "下载登机牌", parentTaskId: "task-id" });
    });
    expect(await screen.findByText("下载登机牌")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "删除任务" }));
    expect(screen.getByRole("alertdialog", { name: "删除任务？" })).toHaveTextContent("子任务也会一并删除");
    await user.click(screen.getByRole("button", { name: "确认删除" }));
    await waitFor(() => expect(fetchMock.mock.calls.some(([path, init]) => path === "/api/tasks/task-id" && init?.method === "DELETE")).toBe(true));
  });

  test("lets users complete and reopen a subtask in task details", async () => {
    window.history.replaceState({}, "", "/contexts/travel-id");
    const subtask = task({ id: "child-id", title: "下载登机牌", parentTaskId: "task-id", dueAt: null, contextId: null });
    const { fetchMock } = statefulFetch([task({ subtasks: [subtask] })]);
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole("button", { name: "确认航班" }));
    await user.click(screen.getByRole("button", { name: "完成子任务 下载登机牌" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "重新打开子任务 下载登机牌" })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "重新打开子任务 下载登机牌" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "完成子任务 下载登机牌" })).toBeInTheDocument());
    expect(fetchMock.mock.calls.filter(([path, init]) => path === "/api/tasks/child-id/toggle" && init?.method === "POST")).toHaveLength(2);
  });

  test("supports search, simple date/newest sorting, and a completed section", async () => {
    window.history.replaceState({}, "", "/contexts/travel-id");
    const done = task({ id: "done-id", title: "预订酒店", isCompleted: true, completedAt: stamp });
    const { fetchMock } = statefulFetch([task(), done]);
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<App />);

    const sort = await screen.findByLabelText("任务排序");
    expect(Array.from((sort as HTMLSelectElement).options).map((option) => option.value)).toEqual(["createdAt", "dueDate"]);
    await user.selectOptions(sort, "dueDate");
    await waitFor(() => expect(fetchMock.mock.calls.some(([path]) => String(path).includes("sort=dueDate"))).toBe(true));
    await user.type(screen.getByLabelText("搜索任务"), "航班");
    await waitFor(() => expect(fetchMock.mock.calls.some(([path]) => String(path).includes("search=%E8%88%AA%E7%8F%AD"))).toBe(true));
    await user.click(screen.getByText("已完成 1"));
    expect(screen.getByText("预订酒店")).toBeInTheDocument();
  });
});
