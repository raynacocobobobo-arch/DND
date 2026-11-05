// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { App } from "../src/App";
import { queryClient } from "../src/api/queryClient";

const stamp = "2026-11-05T01:00:00.000Z";
const base = {
  notes: "", priority: "medium", dueAt: null, isCompleted: false, completedAt: null,
  contextId: null, parentTaskId: null, repeatInterval: "none", repeatRule: "",
  createdAt: stamp, updatedAt: stamp, subtasks: []
};
function reply(body: unknown, status = 200) {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status, headers: status === 204 ? undefined : {"content-type":"application/json"}
  });
}
function project(id: string, title: string, extra: Record<string,unknown> = {}) {
  return {...base, id, title, ...extra};
}
function apiMock(initial: Array<Record<string,any>>) {
  const roots = initial.map(item => ({...item, subtasks:[...(item.subtasks ?? [])]}));
  const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const path = String(input);
    const method = init?.method ?? "GET";
    if (path === "/api/session") return reply({authenticated:true});
    if (path.startsWith("/api/tasks?") && method === "GET") {
      const url = new URL(path,"http://localhost");
      return reply(roots.filter(task =>
        url.searchParams.get("scope") === "inbox" ? task.contextId === null : true
      ));
    }
    if (path === "/api/tasks" && method === "POST") {
      const data = JSON.parse(String(init?.body));
      const created = {...base, ...data, id:"added-" + Math.random().toString(36).slice(2)};
      if (created.parentTaskId) {
        const parent = roots.find(task => task.id === created.parentTaskId);
        if (parent) parent.subtasks.push(created);
      } else roots.push({...created,subtasks:[]});
      return reply(created,201);
    }
    const matched = /^\/api\/tasks\/([^/]+)(\/toggle)?$/.exec(path);
    if (matched) {
      const id = matched[1];
      const record = roots.flatMap(item => [item,...(item.subtasks ?? [])]).find(item => item.id === id);
      if (!record) return reply({error:{code:"NOT_FOUND",message:"不存在"}},404);
      if (matched[2] && method === "POST") {
        record.isCompleted = !record.isCompleted;
        record.completedAt = record.isCompleted ? stamp : null;
        return reply(record);
      }
      if (method === "PATCH") {
        Object.assign(record,JSON.parse(String(init?.body)));
        return reply(record);
      }
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

describe("independent project-based to-do list", () => {
  test("shows only standalone projects, not tasks inside Scenes", async () => {
    const child = project("child","检查公积金", {parentTaskId:"monthly"});
    vi.stubGlobal("fetch", apiMock([
      project("monthly","每月账务核对", {repeatInterval:"custom",repeatRule:"每月22日",subtasks:[child]}),
      project("scene","场景内部任务",{contextId:"scene-id"})
    ]));
    render(<App />);
    expect(await screen.findByRole("heading",{name:/待办清单/})).toBeInTheDocument();
    expect(await screen.findByRole("link",{name:/每月账务核对/})).toBeInTheDocument();
    expect(screen.queryByText("场景内部任务")).not.toBeInTheDocument();
    expect(screen.getByRole("button",{name:"未完成的"})).toHaveAttribute("aria-pressed","true");
    expect(screen.getByText("0/1 项子待办")).toBeInTheDocument();
  });

  test("opens a project page with its own subtask checklist and two-state filter", async () => {
    const unfinished = project("open-child","检查公积金5000",{parentTaskId:"monthly"});
    const done = project("done-child","检查银行卡",{parentTaskId:"monthly",isCompleted:true,completedAt:stamp});
    vi.stubGlobal("fetch", apiMock([
      project("monthly","每月账务核对",{repeatInterval:"monthly",dueAt:"2026-11-22T01:00:00.000Z",subtasks:[unfinished,done]})
    ]));
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole("link",{name:/每月账务核对/}));
    expect(window.location.pathname).toBe("/inbox/monthly");
    expect(await screen.findByRole("heading",{name:"子待办"})).toBeInTheDocument();
    expect(screen.getByText("检查公积金5000")).toBeInTheDocument();
    expect(screen.queryByText("检查银行卡")).not.toBeInTheDocument();
    expect(screen.getByText("↻ 每月")).toBeInTheDocument();
    await user.click(screen.getByRole("button",{name:"全部"}));
    expect(screen.getByText("检查银行卡")).toBeInTheDocument();
    await user.click(screen.getByRole("button",{name:"未完成的"}));
    expect(screen.queryByText("检查银行卡")).not.toBeInTheDocument();
  });

  test("creates and ticks subtasks without changing the scene directory", async () => {
    const fetchMock = apiMock([project("monthly","每月账务核对")]);
    vi.stubGlobal("fetch",fetchMock);
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole("link",{name:/每月账务核对/}));
    await user.type(screen.getByLabelText("添加子待办"),"检查公积金");
    await user.click(screen.getByRole("button",{name:/添加/}));
    expect(await screen.findByText("检查公积金")).toBeInTheDocument();
    const creation = fetchMock.mock.calls.find(([url,init]) => url === "/api/tasks" && init?.method === "POST");
    expect(JSON.parse(String(creation?.[1]?.body))).toMatchObject({title:"检查公积金",parentTaskId:"monthly"});
    await user.click(screen.getByRole("button",{name:"完成 检查公积金"}));
    await waitFor(() => expect(screen.queryByText("检查公积金")).not.toBeInTheDocument());
    await user.click(screen.getByRole("button",{name:"全部"}));
    expect(await screen.findByText("检查公积金")).toBeInTheDocument();
  });

  test("switches the main list between unfinished and all projects", async () => {
    vi.stubGlobal("fetch",apiMock([
      project("active","待办项目"),
      project("archived","已完成项目",{isCompleted:true,completedAt:stamp})
    ]));
    const user = userEvent.setup();
    render(<App />);
    expect(await screen.findByRole("link",{name:/待办项目/})).toBeInTheDocument();
    expect(screen.queryByRole("link",{name:/已完成项目/})).not.toBeInTheDocument();
    await user.click(screen.getByRole("button",{name:"全部"}));
    expect(await screen.findByRole("link",{name:/已完成项目/})).toBeInTheDocument();
  });

  test("creates a root project with no scene assignment and opens its recurrence editor", async () => {
    const fetchMock=apiMock([project("monthly","每月账务核对")]);
    vi.stubGlobal("fetch",fetchMock);
    const user=userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole("button",{name:"＋ 新建大项目"}));
    expect(await screen.findByRole("dialog",{name:"新建任务"})).toBeInTheDocument();
    await user.type(screen.getByLabelText("任务标题"),"每周备份资料");
    await user.type(screen.getByLabelText("截止日期"),"2026-11-09");
    await user.click(screen.getByText("更多选项",{exact:false}));
    await user.selectOptions(screen.getByLabelText("重复"),"weekly");
    await user.click(screen.getByRole("button",{name:"保存任务"}));
    await waitFor(() => {
      const call=fetchMock.mock.calls.find(([url,init])=>url==="/api/tasks"&&init?.method==="POST");
      expect(call).toBeTruthy();
      expect(JSON.parse(String(call?.[1]?.body))).toMatchObject({
        title:"每周备份资料",contextId:null,repeatInterval:"weekly",
        dueAt:"2026-11-09T01:00:00.000Z"
      });
    });
    await user.click(await screen.findByRole("link",{name:/每月账务核对/}));
    await user.click(screen.getByRole("button",{name:"编辑项目与循环规则"}));
    expect(await screen.findByRole("dialog",{name:"任务详情"})).toBeInTheDocument();
    expect(screen.getByLabelText("重复")).toBeInTheDocument();
  });
});
