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
const travel = {
  id: "travel-id",
  name: "旅行",
  icon: "suitcase",
  color: "#EEB0A8",
  sortOrder: 0,
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

describe("contexts interface", () => {
  test("uses the list-first homepage input to create and edit a context", async () => {
    window.history.replaceState({}, "", "/contexts");
    const contexts = [{ ...travel }];
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const path = String(input);
      if (path === "/api/session") return jsonResponse({ authenticated: true });
      if (path === "/api/contexts" && (!init?.method || init.method === "GET")) return jsonResponse(contexts);
      if (path === "/api/contexts" && init?.method === "POST") {
        const body = JSON.parse(String(init.body));
        const created = { ...travel, ...body, id: "work-id", sortOrder: 1, incompleteCount: 0 };
        contexts.push(created);
        return jsonResponse(created, 201);
      }
      if (path === "/api/contexts/work-id" && init?.method === "PATCH") {
        Object.assign(contexts[1]!, JSON.parse(String(init.body)));
        return jsonResponse(contexts[1]);
      }
      throw new Error(`Unexpected request: ${init?.method ?? "GET"} ${path}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<App />);

    const list = await screen.findByRole("list", { name: "清单列表" });
    expect(list).toHaveClass("context-grid");

    expect(screen.queryByRole("button", { name: "新建清单" })).not.toBeInTheDocument();
    const quickName = screen.getByLabelText("快速新建清单");
    expect(quickName).toHaveAttribute("placeholder", "新建清单，写下一个场景名称…");

    await user.click(screen.getByRole("button", { name: "添加清单" }));
    expect(await screen.findByRole("dialog", { name: "新建清单" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "#8CAABA" })).toBeChecked();
    expect(screen.getAllByRole("button", { name: /^(金狮|百合花|罗盘|生命树|典籍|双剑|王冠|羽笔卷轴)$/ })).toHaveLength(8);
    expect(screen.getByRole("button", { name: "百合花" })).toHaveAttribute("aria-pressed","true");
    await user.click(screen.getByRole("button", { name: "取消" }));

    await user.type(quickName, "工作");
    await user.click(screen.getByRole("button", { name: "添加清单" }));
    expect(await screen.findByRole("link", { name: /工作/ })).toBeInTheDocument();
    const createCall = fetchMock.mock.calls.find(([path, init]) => path === "/api/contexts" && init?.method === "POST");
    expect(JSON.parse(String(createCall?.[1]?.body))).toMatchObject({ name: "工作", icon: "folder", color: "#8CAABA" });

    await user.click(screen.getByRole("button", { name: "编辑 工作" }));
    const name = screen.getByLabelText("清单名称");
    await user.clear(name);
    await user.type(name, "客户项目");
    await user.click(screen.getByRole("button", { name: "保存" }));
    expect(await screen.findByRole("link", { name: /客户项目/ })).toBeInTheDocument();
  });

  test("explains that deleting a context keeps tasks and requires confirmation", async () => {
    window.history.replaceState({}, "", "/contexts");
    const contexts = [{ ...travel }];
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const path = String(input);
      if (path === "/api/session") return jsonResponse({ authenticated: true });
      if (path === "/api/contexts" && (!init?.method || init.method === "GET")) return jsonResponse(contexts);
      if (path === "/api/contexts/travel-id" && init?.method === "DELETE") {
        contexts.splice(0);
        return jsonResponse(null, 204);
      }
      throw new Error(`Unexpected request: ${path}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole("button", { name: "删除 旅行" }));
    const dialog = screen.getByRole("alertdialog", { name: "删除清单？" });
    expect(dialog).toHaveTextContent("清单内的任务不会被删除，将返回收集箱");
    await user.click(screen.getByRole("button", { name: "确认删除" }));
    await waitFor(() => expect(screen.queryByRole("link", { name: /旅行/ })).not.toBeInTheDocument());
  });

  test("copies the iOS-style todo format and quick-adds without a due date", async () => {
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
      const post = fetchMock.mock.calls.find(([path, init]) => path === "/api/tasks" && init?.method === "POST");
      expect(JSON.parse(String(post?.[1]?.body))).toMatchObject({
        title: "购买转换插头",
        contextId: "travel-id",
        dueAt: null
      });
    });
  });
  test("opens the scene/list directory at the root instead of the old dashboard", async () => {
    window.history.replaceState({}, "", "/");
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => {
      const path = String(input);
      if (path === "/api/session") return jsonResponse({ authenticated: true });
      if (path === "/api/contexts") return jsonResponse([travel]);
      if (path.startsWith("/api/tasks")) return jsonResponse([]);
      throw new Error(`Unexpected request: ${path}`);
    }));
    render(<App />);
    expect(await screen.findByRole("heading", { name: "我的清单" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "场景目录" })).toBeInTheDocument();
    expect(await screen.findByRole("list", { name: "清单列表" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /进入收集箱/ })).toHaveAttribute("href", "/inbox");
    expect(screen.queryByRole("heading", { name: "我的待办" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /旅行/ })).toHaveAttribute("href", "/contexts/travel-id");
  });

});
