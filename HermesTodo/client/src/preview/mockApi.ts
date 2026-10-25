/**
 * Standalone, browser-only API for the public HermesTodo preview.
 * Does not call the production API or handle real credentials.
 * The regular app build excludes this module.
 */
type ContextItem = {
  id: string; name: string; icon: string; color: string; sortOrder: number;
  createdAt: string; updatedAt: string;
};
type TaskItem = {
  id: string; title: string; notes: string; priority: "high" | "medium" | "low";
  dueAt: string | null; isCompleted: boolean; completedAt: string | null;
  contextId: string | null; parentTaskId: string | null;
  repeatInterval: "none" | "daily" | "weekly" | "monthly" | "yearly" | "custom";
  repeatRule: string; createdAt: string; updatedAt: string;
};
type DemoStore = { contexts: ContextItem[]; tasks: TaskItem[] };
const STORAGE_KEY = "hermestodo-public-preview-v1";
const nowISO = () => new Date().toISOString();
const id = () => crypto.randomUUID();
const shanghaiDate = () => new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit"
}).format(new Date());
const today = shanghaiDate();
const due = (offset: number) => new Date(`${today}T09:00:00+08:00`).getTime() + offset * 86400000;
const isoDue = (offset: number) => new Date(due(offset)).toISOString();
const demoContexts: ContextItem[] = [
  { id: "work", name: "工作项目", icon: "briefcase", color: "#8CAABA", sortOrder: 0, createdAt: nowISO(), updatedAt: nowISO() },
  { id: "life", name: "个人生活", icon: "house", color: "#9AB898", sortOrder: 1, createdAt: nowISO(), updatedAt: nowISO() },
  { id: "creative", name: "创作灵感", icon: "book-open", color: "#C0A8C8", sortOrder: 2, createdAt: nowISO(), updatedAt: nowISO() }
];
const makeTask = (title: string, contextId: string | null, dueAt: string | null, priority: TaskItem["priority"] = "medium"): TaskItem => ({
  id: id(), title, notes: "", priority, dueAt, isCompleted: false, completedAt: null,
  contextId, parentTaskId: null, repeatInterval: "none", repeatRule: "",
  createdAt: nowISO(), updatedAt: nowISO()
});
const seed: DemoStore = {
  contexts: demoContexts,
  tasks: [
    makeTask("记下一个临时想法", null, null),
    makeTask("买咖啡豆", null, null),
    makeTask("检查 HermesTodo 新版交互", "work", isoDue(0), "high"),
    makeTask("整理下一阶段产品需求", "work", isoDue(0), "medium"),
    makeTask("记录一个新创作想法", "creative", isoDue(0), "low"),
    makeTask("处理前几天未完成的任务", "life", isoDue(-2), "high")
  ]
};
function read(): DemoStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoStore;
      if (Array.isArray(parsed.contexts) && Array.isArray(parsed.tasks)) return parsed;
    }
  } catch {
    // Private browsing can deny localStorage. The demo still works in memory.
  }
  return seed;
}
let store = read();
function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch { /* nonpersistent demo */ }
}
persist();
function getTasks(search: URLSearchParams) {
  let records = store.tasks.filter(t => t.parentTaskId === null);
  if (search.has("contextId")) records = records.filter(t => t.contextId === search.get("contextId"));
  if (search.get("scope") === "inbox") records = records.filter(t => t.contextId === null);
  const keyword = search.get("search")?.trim().toLocaleLowerCase() ?? "";
  if (keyword) records = records.filter(t => (t.title + " " + t.notes).toLocaleLowerCase().includes(keyword));
  const weight = { high: 0, medium: 1, low: 2 };
  const sort = search.get("sort");
  records = [...records].sort((a, b) => {
    if (sort === "createdAt") return b.createdAt.localeCompare(a.createdAt);
    if (sort === "dueDate") return (a.dueAt ?? "9999").localeCompare(b.dueAt ?? "9999") || weight[a.priority] - weight[b.priority];
    return weight[a.priority] - weight[b.priority] || (a.dueAt ?? "9999").localeCompare(b.dueAt ?? "9999");
  });
  return records.map(t => ({
    ...t,
    subtasks: store.tasks.filter(child => child.parentTaskId === t.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map(child => ({ ...child, subtasks: [] }))
  }));
}
function getContexts() {
  return [...store.contexts].sort((a, b) => a.sortOrder - b.sortOrder).map(c => ({
    ...c,
    incompleteCount: store.tasks.filter(t => t.contextId === c.id && !t.isCompleted).length
  }));
}
function taskRecord(task: TaskItem) {
  return { ...task, subtasks: store.tasks.filter(t => t.parentTaskId === task.id).map(t => ({ ...t, subtasks: [] })) };
}
function createTask(data: Partial<TaskItem>) {
  const task = { ...makeTask(String(data.title ?? "").trim(), data.contextId ?? null, data.dueAt ?? null), ...data };
  if (task.parentTaskId) {
    task.contextId = null;
    task.dueAt = null;
    task.repeatInterval = "none";
    task.repeatRule = "";
  }
  store.tasks.push(task);
  persist();
  return taskRecord(task);
}
function bodyOf(init?: RequestInit): Record<string, any> {
  try { return JSON.parse(String(init?.body ?? "{}")) as Record<string, any>; } catch { return {}; }
}
const originalFetch = window.fetch.bind(window);
window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = new URL(input instanceof Request ? input.url : String(input), location.href);
  if (url.origin !== location.origin || !url.pathname.startsWith("/api/")) return originalFetch(input, init);
  const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
  const path = url.pathname;
  const data = bodyOf(init);
  const reply = (payload: unknown, status = 200) => new Response(status === 204 ? null : JSON.stringify(payload), {
    status, headers: status === 204 ? undefined : { "content-type": "application/json" }
  });
  const error = (message: string, status = 400) => reply({ error: { code: "DEMO_ERROR", message } }, status);
  if (path === "/api/session") return reply({ authenticated: true });
  if (path === "/api/auth/login") return reply({ authenticated: true });
  if (path === "/api/auth/logout") return reply(null, 204);
  if (path === "/api/contexts" && method === "GET") return reply(getContexts());
  if (path === "/api/contexts" && method === "POST") {
    if (!String(data.name ?? "").trim()) return error("请输入情境名称");
    const item: ContextItem = { id: id(), name: data.name.trim(), icon: data.icon || "folder",
      color: data.color || "#8CAABA", sortOrder: store.contexts.length,
      createdAt: nowISO(), updatedAt: nowISO() };
    store.contexts.push(item); persist(); return reply({ ...item, incompleteCount: 0 }, 201);
  }
  const cm = /^\/api\/contexts\/([^/]+)$/.exec(path);
  if (cm) {
    const c = store.contexts.find(x => x.id === cm[1]);
    if (!c) return error("情境不存在", 404);
    if (method === "PATCH") {
      Object.assign(c, data, { updatedAt: nowISO() }); persist();
      return reply({ ...c, incompleteCount: store.tasks.filter(x => x.contextId === c.id && !x.isCompleted).length });
    }
    if (method === "DELETE") {
      store.contexts = store.contexts.filter(x => x.id !== c.id);
      for (const t of store.tasks) if (t.contextId === c.id) t.contextId = null;
      persist(); return reply(null, 204);
    }
  }
  if (path === "/api/tasks" && method === "GET") return reply(getTasks(url.searchParams));
  if (path === "/api/tasks" && method === "POST") {
    if (!String(data.title ?? "").trim()) return error("请输入任务名称");
    if (data.parentTaskId && !store.tasks.some(x => x.id === data.parentTaskId)) return error("父任务不存在");
    return reply(createTask(data), 201);
  }
  const tm = /^\/api\/tasks\/([^/]+)(\/toggle)?$/.exec(path);
  if (tm) {
    const t = store.tasks.find(x => x.id === tm[1]);
    if (!t) return error("任务不存在", 404);
    if (tm[2] === "/toggle" && method === "POST") {
      t.isCompleted = !t.isCompleted;
      t.completedAt = t.isCompleted ? nowISO() : null;
      t.updatedAt = nowISO(); persist(); return reply(taskRecord(t));
    }
    if (method === "PATCH") {
      Object.assign(t, data, { updatedAt: nowISO() }); persist(); return reply(taskRecord(t));
    }
    if (method === "DELETE") {
      store.tasks = store.tasks.filter(x => x.id !== t.id && x.parentTaskId !== t.id);
      persist(); return reply(null, 204);
    }
  }
  if (path === "/api/ai/plan" && method === "POST") {
    const messages = Array.isArray(data.messages) ? data.messages : [];
    const goal = String(messages.at(-1)?.content ?? "计划").trim();
    const label = goal.slice(0, 14) || "新计划";
    return reply({
      reply: "这是离线交互预览：AI 区域使用本地示例规则，不调用正式 AI 服务。以下步骤可直接汇总进演示待办。",
      suggestions: [
        { title: "明确目标与范围", context: label, category: "规划", note: goal.slice(0, 90), priority: "high" },
        { title: "拆分关键步骤", context: label, category: "执行", note: "列出依赖、资源和预计完成顺序", priority: "medium" },
        { title: "检查执行结果", context: label, category: "复盘", note: "核对结果并安排下一步", priority: "low" }
      ],
      options: ["补充执行细节", "设定完成标准"]
    });
  }
  if (path === "/api/ai/import-list" && method === "POST") {
    const lines = String(data.raw ?? "").split(/\r?\n/).map((x: string) => x.replace(/^\s*(?:[-*•]|\d+[.)、])\s*/, "").trim()).filter(Boolean).slice(0, 40);
    const context = String(data.contextHint || "导入清单").slice(0, 40);
    return reply({
      reply: `在演示模式下从文本整理出 ${lines.length} 项。正式版可以进一步调用 AI 分类。`,
      suggestions: lines.map((title: string) => ({ title: title.slice(0, 12), context, category: "导入任务", note: title.slice(12, 100), priority: "medium" })),
      options: []
    });
  }
  if (path === "/api/ai/commit-suggestions" && method === "POST") {
    const list = Array.isArray(data.suggestions) ? data.suggestions : [];
    const createdTasks: object[] = [];
    let skippedCount = 0;
    for (const item of list) {
      let context = store.contexts.find(x => x.name === item.context);
      if (!context) {
        context = { id: id(), name: String(item.context || "AI 任务").slice(0, 40),
          icon: "folder", color: "#8CAABA", sortOrder: store.contexts.length,
          createdAt: nowISO(), updatedAt: nowISO() };
        store.contexts.push(context);
      }
      if (store.tasks.some(t => t.contextId === context!.id && t.title === item.title)) { skippedCount++; continue; }
      createdTasks.push(createTask({ title: item.title, notes: item.note || "", priority: item.priority || "medium", contextId: context.id }));
    }
    persist(); return reply({ createdTasks, skippedCount });
  }
  return error(`该功能未包含在演示版：${method} ${path}`, 404);
};

export {};
