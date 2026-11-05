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
  const roots: Array<Record<string,any>> = initial.map(item => ({...item, subtasks:[...(item.subtasks ?? [])]}));
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
    expect(screen.queryByText(/\d+\/\d+ 项子待办/)).not.toBeInTheDocument();
    expect(screen.queryByText("进入项目详情")).not.toBeInTheDocument();
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

  test("two visible checkboxes react independently before either cloud write finishes", async () => {
    const waiting: Record<string,(response:Response)=>void>={};
    const input=[project("first","立即勾选一"),project("second","立即勾选二")];
    const network=vi.fn(async (url:string | URL | Request,init?:RequestInit)=>{
      const path=String(url);
      if(path==="/api/session")return reply({authenticated:true});
      if(path.startsWith("/api/tasks?"))return reply(input);
      if(path.startsWith("/api/tasks/") && path.endsWith("/toggle") && init?.method==="POST"){
        const id=path.split("/")[3];
        return await new Promise<Response>(resolve=>{waiting[id]=resolve;});
      }
      if(path==="/api/contexts")return reply([]);
      throw new Error("Unexpected request "+path);
    });
    vi.stubGlobal("fetch",network);
    const user=userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole("button",{name:"全部"}));
    await user.click(await screen.findByRole("button",{name:"完成 立即勾选一"}));
    expect(await screen.findByRole("button",{name:"重新打开 立即勾选一"}))
      .toHaveAttribute("aria-pressed","true");
    const other=screen.getByRole("button",{name:"完成 立即勾选二"});
    expect(other).toBeEnabled();
    await user.click(other);
    expect(await screen.findByRole("button",{name:"重新打开 立即勾选二"}))
      .toHaveAttribute("aria-pressed","true");
    await waitFor(()=>expect(Object.keys(waiting).sort()).toEqual(["first","second"]));
    waiting.first(reply({id:"first",isCompleted:true,completedAt:new Date().toISOString()}));
    waiting.second(reply({id:"second",isCompleted:true,completedAt:new Date().toISOString()}));
    await waitFor(()=>expect(screen.getByRole("button",{name:"重新打开 立即勾选二"}))
      .toHaveAttribute("aria-pressed","true"));
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

  test("shows subtasks directly on the timeline and folds them without leaving the page", async () => {
    const open = project("first","核对银行账户",{parentTaskId:"monthly"});
    const finished = project("second","核对余额",{parentTaskId:"monthly",isCompleted:true,completedAt:stamp});
    vi.stubGlobal("fetch",apiMock([
      project("monthly","月度核算",{subtasks:[open,finished]})
    ]));
    const user=userEvent.setup();
    render(<App />);
    const group=await screen.findByRole("list",{name:"月度核算 子待办"});
    expect(group).toBeVisible();
    expect(screen.getByText("核对银行账户")).toBeInTheDocument();
    expect(screen.queryByText("核对余额")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button",{name:"折叠子待办 月度核算"}));
    expect(screen.getByRole("button",{name:"展开子待办 月度核算"})).toHaveAttribute("aria-expanded","false");
    expect(group).not.toBeVisible();
    await user.click(screen.getByRole("button",{name:"展开子待办 月度核算"}));
    expect(group).toBeVisible();
    await user.click(screen.getByRole("button",{name:"全部"}));
    expect(screen.getByText("核对余额")).toBeInTheDocument();
    await user.click(screen.getByRole("button",{name:"未完成的"}));
    await user.click(screen.getByRole("button",{name:"完成 核对银行账户"}));
    await waitFor(()=>expect(screen.queryByText("核对银行账户")).not.toBeInTheDocument());
  });

  test("reference nine-cell picker saves weekday immediately and can pause", async () => {
    const fetchMock=apiMock([project("weekly","每周核算",{dueAt:"2026-11-05T01:00:00.000Z"})]);
    vi.stubGlobal("fetch",fetchMock);
    const user=userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole("button",{name:"设置循环 每周核算"}));
    expect(await screen.findByRole("dialog",{name:"循环设置"})).toBeInTheDocument();
    expect(screen.getAllByRole("button").filter(x=>["周一","周二","周三","周四","周五","周六","周日","每周","每月"].includes(x.textContent||""))).toHaveLength(9);
    await user.click(screen.getByRole("button",{name:"周三"}));
    await waitFor(()=>{
      const call=fetchMock.mock.calls.find(([url,init])=>url==="/api/tasks/weekly"&&init?.method==="PATCH");
      expect(call).toBeTruthy();
      expect(JSON.parse(String(call?.[1]?.body))).toMatchObject({repeatInterval:"custom",repeatRule:"每周三"});
    });
    expect(screen.queryByRole("dialog",{name:"循环设置"})).not.toBeInTheDocument();
    await user.click(await screen.findByRole("button",{name:"设置循环 每周核算"}));
    expect(screen.getByRole("button",{name:"周三"})).toHaveAttribute("aria-pressed","true");
    await user.click(screen.getByRole("button",{name:"暂停"}));
    await waitFor(()=>{
      const calls=fetchMock.mock.calls.filter(([url,init])=>url==="/api/tasks/weekly"&&init?.method==="PATCH");
      expect(JSON.parse(String(calls.at(-1)?.[1]?.body))).toMatchObject({repeatInterval:"none",repeatRule:""});
    });
  });

  test("tapping monthly starts the cycle at the real tap instant, never an old due date", async () => {
    const fetchMock=apiMock([project("monthly-tap","每月归档",{
      dueAt:"2024-01-08T01:00:00.000Z"
    })]);
    vi.stubGlobal("fetch",fetchMock);
    const user=userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole("button",{name:"设置循环 每月归档"}));
    const before=Date.now();
    await user.click(screen.getByRole("button",{name:"每月"}));
    const after=Date.now();
    await waitFor(()=>{
      const call=fetchMock.mock.calls.find(([url,init])=>url==="/api/tasks/monthly-tap"&&init?.method==="PATCH");
      expect(call).toBeTruthy();
      const payload=JSON.parse(String(call?.[1]?.body));
      expect(payload).toMatchObject({repeatInterval:"monthly",repeatRule:""});
      const clicked=new Date(payload.dueAt).getTime();
      expect(clicked).toBeGreaterThanOrEqual(before);
      expect(clicked).toBeLessThanOrEqual(after);
      expect(payload.dueAt).not.toBe("2024-01-08T01:00:00.000Z");
    });
    expect(screen.queryByRole("dialog",{name:"循环设置"})).not.toBeInTheDocument();
  });

  test("existing monthly day rule is preserved when dialog is cancelled", async () => {
    const fetchMock=apiMock([project("existing","每月22日账单",{
      repeatInterval:"custom",repeatRule:"每月22日"
    })]);
    vi.stubGlobal("fetch",fetchMock);
    const user=userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole("button",{name:"设置循环 每月22日账单"}));
    expect(screen.getByRole("button",{name:"每月"})).toHaveAttribute("aria-pressed","true");
    await user.click(screen.getByRole("button",{name:"取消"}));
    expect(fetchMock.mock.calls.filter(([url,init])=>url==="/api/tasks/existing"&&init?.method==="PATCH")).toHaveLength(0);
  });

  test("recurring parent owns one loop control, children show no duplicate cycle captions", async () => {
    const children=[
      project("c1","第一个子项目",{parentTaskId:"root",repeatInterval:"none",notes:"完整备注"}),
      project("c2","第二个子项目",{parentTaskId:"root",repeatInterval:"daily",checkinCount:3,scheduledCount:5})
    ];
    vi.stubGlobal("fetch",apiMock([
      project("root","888",{repeatInterval:"monthly",dueAt:stamp,subtasks:children})
    ]));
    const user=userEvent.setup();
    render(<App />);
    const title=await screen.findByRole("link",{name:/888/});
    expect(title).toHaveAttribute("href","/inbox/root");
    expect(screen.getByText("完整备注")).toBeInTheDocument();
    expect(screen.queryByText(/项子待办/)).not.toBeInTheDocument();
    expect(screen.queryByText(/已打卡/)).not.toBeInTheDocument();
    expect(screen.queryByText("进入项目详情")).not.toBeInTheDocument();
    expect(screen.getByRole("button",{name:"设置循环 888"}).querySelector("svg")).not.toBeNull();
    expect(screen.queryByRole("button",{name:"设置循环 第一个子项目"})).not.toBeInTheDocument();
    expect(screen.queryByRole("button",{name:"设置循环 第二个子项目"})).not.toBeInTheDocument();
    await user.click(title);
    expect(await screen.findByRole("heading",{name:"子待办"})).toBeInTheDocument();
    expect(screen.queryByRole("button",{name:"设置循环 第一个子项目"})).not.toBeInTheDocument();
  });

  test("each subtask has a visible independent recurrence button", async () => {
    vi.stubGlobal("fetch",apiMock([
      project("root","对账清单",{subtasks:[project("child","浦发银行卡",{parentTaskId:"root",notes:"核对余额与账单"})]})
    ]));
    const user=userEvent.setup();
    render(<App />);
    expect(await screen.findByText("核对余额与账单")).toBeInTheDocument();
    await user.click(screen.getByRole("button",{name:"设置循环 浦发银行卡"}));
    expect(await screen.findByRole("dialog",{name:"循环设置"})).toBeInTheDocument();
  });

  test("project detail also opens the recurrence dialog via the top-right icon", async () => {
    vi.stubGlobal("fetch",apiMock([project("monthly","每月对账")]));
    const user=userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole("link",{name:/每月对账/}));
    await user.click(screen.getByRole("button",{name:"设置循环 每月对账"}));
    expect(await screen.findByRole("dialog",{name:"循环设置"})).toBeInTheDocument();
    await user.click(screen.getByRole("button",{name:"取消"}));
    expect(screen.queryByRole("dialog",{name:"循环设置"})).not.toBeInTheDocument();
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
    await user.click(screen.getByRole("button",{name:"编辑项目"}));
    expect(await screen.findByRole("dialog",{name:"任务详情"})).toBeInTheDocument();
    expect(screen.getByLabelText("重复")).toBeInTheDocument();
  });
});
