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
const travelList = {
  id: "travel-list",
  name: "出国旅行",
  icon: "compass",
  color: "#8CAABA",
  sortOrder: 0,
  sceneCount: 1,
  taskCount: 1,
  incompleteCount: 1,
  createdAt: stamp,
  updatedAt: stamp
};
const travel = {
  id: "travel-id",
  name: "旅行",
  icon: "suitcase",
  color: "#EEB0A8",
  sortOrder: 0,
  listId: travelList.id,
  incompleteCount: 1,
  createdAt: stamp,
  updatedAt: stamp
};
const baseTask = {
  notes: "",
  priority: "medium",
  dueAt: null,
  completedAt: null,
  contextId: travel.id,
  parentTaskId: null,
  repeatInterval: "none",
  repeatRule: "",
  createdAt: stamp,
  updatedAt: stamp,
  subtasks: []
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("lists and scenes interface", () => {
  test("creates and edits a top-level list with its own crest", async () => {
    window.history.replaceState({}, "", "/");
    const lists = [{ ...travelList }];
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const path = String(input);
      if (path === "/api/session") return jsonResponse({ authenticated: true });
      if (path === "/api/lists" && (!init?.method || init.method === "GET")) return jsonResponse(lists);
      if (path === "/api/lists" && init?.method === "POST") {
        const body = JSON.parse(String(init.body));
        const created = { ...travelList, ...body, id: "work-list", sortOrder: 1, sceneCount: 0, taskCount: 0, incompleteCount: 0 };
        lists.push(created);
        return jsonResponse(created, 201);
      }
      if (path === "/api/lists/work-list" && init?.method === "PATCH") {
        Object.assign(lists[1]!, JSON.parse(String(init.body)));
        return jsonResponse(lists[1]);
      }
      throw new Error(`Unexpected request: ${init?.method ?? "GET"} ${path}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<App />);

    const list = await screen.findByRole("list", { name: "清单列表" });
    expect(list).toHaveClass("context-grid");
    expect(screen.getByRole("button", { name: "移动 出国旅行" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "编辑 出国旅行" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "删除 出国旅行" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "复制 出国旅行" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "一键勾选 出国旅行" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "删除 出国旅行" }));
    expect(screen.getByRole("alertdialog", { name: "删除清单？" })).toHaveTextContent("任务不会删除");
    await user.click(screen.getByRole("button", { name: "取消" }));

    const quickName = screen.getByLabelText("快速新建清单");
    expect(quickName).toHaveAttribute("placeholder", "新建清单，例如：国内旅行、工作项目…");

    await user.click(screen.getByRole("button", { name: "添加清单" }));
    expect(await screen.findByRole("dialog", { name: "新建清单" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^(金狮|百合花|罗盘|生命树|典籍|双剑|王冠|羽笔卷轴)$/ })).toHaveLength(8);
    await user.click(screen.getByRole("button", { name: "取消" }));

    await user.type(quickName, "工作项目");
    await user.click(screen.getByRole("button", { name: "添加清单" }));
    expect(await screen.findByRole("link", { name: /工作项目/ })).toBeInTheDocument();
    const createCall = fetchMock.mock.calls.find(([request, init]) => request === "/api/lists" && init?.method === "POST");
    expect(JSON.parse(String(createCall?.[1]?.body))).toMatchObject({ name: "工作项目", icon: "compass", color: "#8CAABA" });

    await user.click(screen.getByRole("button", { name: "编辑 工作项目" }));
    const name = screen.getByLabelText("清单名称");
    await user.clear(name);
    await user.type(name, "客户项目");
    await user.click(screen.getByRole("button", { name: "保存" }));
    expect(await screen.findByRole("link", { name: /客户项目/ })).toBeInTheDocument();
  });

  test("confirms bulk completion and toggles the whole list back to incomplete", async () => {
    window.history.replaceState({}, "", "/");
    const state = { ...travelList, taskCount: 2, incompleteCount: 2 };
    let completed = false;
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const path = String(input);
      if (path === "/api/session") return jsonResponse({ authenticated: true });
      if (path === "/api/lists" && (!init?.method || init.method === "GET")) return jsonResponse([{ ...state }]);
      if (path === "/api/lists/travel-list/complete" && init?.method === "POST") {
        completed = !completed;
        state.incompleteCount = completed ? 0 : state.taskCount;
        return jsonResponse({ updatedCount: state.taskCount, completed });
      }
      throw new Error(`Unexpected request: ${init?.method ?? "GET"} ${path}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<App />);

    const toggle = await screen.findByRole("button", { name: "一键勾选 出国旅行" });
    await user.click(toggle);
    expect(screen.getByRole("alertdialog", { name: "一键勾选全部待办？" })).toHaveTextContent("全部待办标记为完成");
    expect(fetchMock.mock.calls.filter(([path, init]) => path === "/api/lists/travel-list/complete" && init?.method === "POST")).toHaveLength(0);

    await user.click(screen.getByRole("button", { name: "确认全部完成" }));
    await waitFor(() => expect(screen.getByText("1 个场景 · 0 件待办")).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: "一键勾选 出国旅行" }));
    expect(screen.getByRole("alertdialog", { name: "全部恢复为未完成？" })).toHaveTextContent("恢复为未完成");
    await user.click(screen.getByRole("button", { name: "确认恢复未完成" }));
    await waitFor(() => expect(screen.getByText("1 个场景 · 2 件待办")).toBeInTheDocument());

    expect(fetchMock.mock.calls.filter(([path, init]) => path === "/api/lists/travel-list/complete" && init?.method === "POST")).toHaveLength(2);
  });

  test("keeps scene deletion behind confirmation and returns its tasks to inbox", async () => {
    window.history.replaceState({}, "", "/lists/travel-list");
    const contexts = [{ ...travel }];
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const path = String(input);
      if (path === "/api/session") return jsonResponse({ authenticated: true });
      if (path === "/api/lists") return jsonResponse([travelList]);
      if (path === "/api/contexts?listId=travel-list") return jsonResponse(contexts);
      if (path === "/api/contexts/travel-id" && init?.method === "DELETE") {
        contexts.splice(0);
        return jsonResponse(null, 204);
      }
      throw new Error(`Unexpected request: ${init?.method ?? "GET"} ${path}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole("button", { name: "删除 旅行" }));
    const dialog = screen.getByRole("alertdialog", { name: "删除场景？" });
    expect(dialog).toHaveTextContent("场景内的任务不会被删除，将返回收集箱");
    await user.click(screen.getByRole("button", { name: "确认删除" }));
    await waitFor(() => expect(screen.queryByRole("link", { name: /旅行/ })).not.toBeInTheDocument());
  });

  test("copies the todo format and quick-adds without a due date", async () => {
    window.history.replaceState({}, "", "/contexts/travel-id");
    const tasks = [
      { ...baseTask, id: "open", title: "确认航班", isCompleted: false },
      { ...baseTask, id: "done", title: "预订酒店", isCompleted: true, completedAt: stamp }
    ];
    const writeText = vi.fn(async () => undefined);
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const path = String(input);
      if (path === "/api/session") return jsonResponse({ authenticated: true });
      if (path === "/api/contexts") return jsonResponse([travel]);
      if (path.startsWith("/api/tasks") && (!init?.method || init.method === "GET")) return jsonResponse(tasks);
      if (path === "/api/tasks" && init?.method === "POST") {
        const body = JSON.parse(String(init.body));
        const created = { ...baseTask, ...body, id: "new", isCompleted: false, subtasks: [] };
        tasks.push(created);
        return jsonResponse(created, 201);
      }
      throw new Error(`Unexpected request: ${init?.method ?? "GET"} ${path}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<App />);

    await screen.findByText("确认航班");
    await user.click(screen.getByRole("button", { name: "复制待办" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("【旅行】\n○ 确认航班\n● 预订酒店"));

    await user.type(screen.getByLabelText("快速添加清单任务"), "购买转换插头");
    await user.click(screen.getByRole("button", { name: "添加" }));
    await waitFor(() => {
      const post = fetchMock.mock.calls.find(([request, init]) => request === "/api/tasks" && init?.method === "POST");
      expect(JSON.parse(String(post?.[1]?.body))).toMatchObject({
        title: "购买转换插头",
        contextId: "travel-id",
        dueAt: null
      });
    });
  });

  test("opens top-level lists at root and keeps scenes one level below", async () => {
    window.history.replaceState({}, "", "/");
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => {
      const path = String(input);
      if (path === "/api/session") return jsonResponse({ authenticated: true });
      if (path === "/api/lists") return jsonResponse([travelList]);
      throw new Error(`Unexpected request: ${path}`);
    }));
    render(<App />);
    expect(await screen.findByRole("heading", { name: "我的清单" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "清单目录" })).toBeInTheDocument();
    expect(await screen.findByRole("list", { name: "清单列表" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /进入收集箱/ })).toHaveAttribute("href", "/inbox");
    expect(screen.getByRole("link", { name: /出国旅行/ })).toHaveAttribute("href", "/lists/travel-list");
  });
});
