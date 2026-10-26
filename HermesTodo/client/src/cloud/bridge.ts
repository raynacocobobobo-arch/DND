/**
 * Browser-only Supabase adapter for the public GitHub Pages build.
 * Maps the existing HermesTodo JSON API onto PostgREST and Supabase Auth.
 * All database access is scoped by Supabase RLS; no privileged key is used.
 */
import { readCloudConfig, type CloudConfig } from "./config";

type JsonObject = Record<string, unknown>;
type Session = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user_id: string;
  project_url: string;
};
type DbContext = {
  id: string; name: string; icon: string; color: string; sort_order: number;
  created_at: string; updated_at: string;
};
type DbTask = {
  id: string; title: string; notes: string; priority: string;
  due_at: string | null; is_completed: boolean; completed_at: string | null;
  context_id: string | null; parent_task_id: string | null;
  repeat_interval: string; repeat_rule: string;
  created_at: string; updated_at: string;
};
const SESSION_KEY = "hermestodo-supabase-session-v1";

function readSession(config: CloudConfig): Session | null {
  try {
    const item = JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null") as Partial<Session>;
    if (item.project_url !== config.url || !item.access_token || !item.refresh_token || !item.user_id || !item.expires_at) return null;
    return item as Session;
  } catch { return null; }
}
function saveSession(config: CloudConfig, token: JsonObject): Session {
  const user = token.user as { id?: string } | undefined;
  const previous = readSession(config);
  if (!token.access_token || !token.refresh_token || !(user?.id ?? previous?.user_id)) throw new Error("Supabase 未返回有效的登录凭证");
  const session: Session = {
    access_token: String(token.access_token),
    refresh_token: String(token.refresh_token),
    expires_at: Math.floor(Date.now() / 1000) + Number(token.expires_in ?? 3600),
    user_id: String(user?.id ?? previous?.user_id),
    project_url: config.url
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}
function serverError(body: JsonObject, fallback: string): Error {
  return new Error(String(body.msg ?? body.message ?? body.error_description ?? (typeof body.error === "string" ? body.error : "") ?? fallback) || fallback);
}
async function publicAuth(config: CloudConfig, endpoint: string, payload: unknown): Promise<JsonObject> {
  const response = await fetchDirect(config.url + "/auth/v1/" + endpoint, {
    method: "POST",
    headers: { apikey: config.publishableKey, "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  const json = await response.json().catch(() => ({})) as JsonObject;
  if (!response.ok) throw serverError(json, "账户登录失败");
  return json;
}
async function accessToken(config: CloudConfig): Promise<Session> {
  const session = readSession(config);
  if (!session) throw new Error("请先登录云端账户");
  if (session.expires_at > Date.now() / 1000 + 75) return session;
  try {
    const token = await publicAuth(config, "token?grant_type=refresh_token", { refresh_token: session.refresh_token });
    return saveSession(config, token);
  } catch {
    localStorage.removeItem(SESSION_KEY);
    throw new Error("云端登录已过期，请重新登录");
  }
}
let fetchDirect: typeof window.fetch;

/** Supabase REST call; RLS is the authorization boundary, NOT this browser code. */
async function rest<T>(config: CloudConfig, endpoint: string, init: RequestInit = {}): Promise<T> {
  const session = await accessToken(config);
  const response = await fetchDirect(config.url + "/rest/v1/" + endpoint, {
    ...init,
    headers: {
      apikey: config.publishableKey,
      Authorization: "Bearer " + session.access_token,
      "content-type": "application/json",
      ...(init.method && init.method !== "GET" ? { Prefer: "return=representation" } : {}),
      ...init.headers
    }
  });
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => ({})) as T & JsonObject;
  if (!response.ok) throw serverError(data, "Supabase 数据库操作失败，请检查初始化 SQL 和访问权限");
  return data;
}
function fields(data: JsonObject, map: Record<string, string>): JsonObject {
  const result: JsonObject = {};
  for (const [key, column] of Object.entries(map)) if (Object.prototype.hasOwnProperty.call(data, key)) result[column] = data[key];
  return result;
}
function toContext(c: DbContext, tasks: DbTask[]) {
  return {
    id: c.id, name: c.name, icon: c.icon, color: c.color, sortOrder: c.sort_order,
    createdAt: c.created_at, updatedAt: c.updated_at,
    incompleteCount: tasks.filter(t => t.context_id === c.id && !t.is_completed).length
  };
}
function toTask(t: DbTask, all: DbTask[], includeChildren = true): JsonObject {
  return {
    id: t.id, title: t.title, notes: t.notes, priority: t.priority,
    dueAt: t.due_at, isCompleted: t.is_completed, completedAt: t.completed_at,
    contextId: t.context_id, parentTaskId: t.parent_task_id,
    repeatInterval: t.repeat_interval, repeatRule: t.repeat_rule,
    createdAt: t.created_at, updatedAt: t.updated_at,
    subtasks: includeChildren
      ? all.filter(x => x.parent_task_id === t.id).map(x => toTask(x, all, false))
      : []
  };
}
const taskFields = {
  title: "title", notes: "notes", priority: "priority", dueAt: "due_at",
  isCompleted: "is_completed", completedAt: "completed_at",
  contextId: "context_id", parentTaskId: "parent_task_id",
  repeatInterval: "repeat_interval", repeatRule: "repeat_rule"
};
const contextFields = { name: "name", icon: "icon", color: "color", sortOrder: "sort_order" };
function jsonResponse(value: unknown, status = 200): Response {
  return new Response(status === 204 ? null : JSON.stringify(value), {
    status, headers: status === 204 ? undefined : { "content-type": "application/json" }
  });
}
function requestBody(init?: RequestInit): JsonObject {
  try { return JSON.parse(String(init?.body ?? "{}")) as JsonObject; } catch { return {}; }
}
async function allTasks(config: CloudConfig): Promise<DbTask[]> {
  return rest<DbTask[]>(config, "hermes_tasks?select=*&order=created_at.desc");
}
async function tasksForDisplay(config: CloudConfig, search: URLSearchParams): Promise<JsonObject[]> {
  const all = await allTasks(config);
  let tasks = all.filter(t => !t.parent_task_id);
  const context = search.get("contextId");
  if (context !== null) tasks = tasks.filter(t => t.context_id === context);
  if (search.get("scope") === "inbox") tasks = tasks.filter(t => t.context_id === null);
  const keyword = (search.get("search") ?? "").toLocaleLowerCase();
  if (keyword) tasks = tasks.filter(t => (t.title + " " + t.notes).toLocaleLowerCase().includes(keyword));
  const weight = (value: string) => value === "high" ? 0 : value === "medium" ? 1 : 2;
  const sort = search.get("sort");
  tasks.sort((a, b) => {
    if (sort === "dueDate") return (a.due_at ?? "9999").localeCompare(b.due_at ?? "9999") || weight(a.priority) - weight(b.priority);
    if (sort === "priority") return weight(a.priority) - weight(b.priority) || (a.due_at ?? "9999").localeCompare(b.due_at ?? "9999");
    return b.created_at.localeCompare(a.created_at);
  });
  return tasks.map(t => toTask(t, all));
}
async function oneTask(config: CloudConfig, id: string): Promise<DbTask> {
  const found = await rest<DbTask[]>(config, "hermes_tasks?select=*&id=eq." + encodeURIComponent(id));
  if (!found[0]) throw new Error("任务不存在");
  return found[0];
}
async function contextCount(config: CloudConfig): Promise<number> {
  const contexts = await rest<DbContext[]>(config, "hermes_contexts?select=id");
  return contexts.length;
}
async function createContext(config: CloudConfig, value: JsonObject): Promise<JsonObject> {
  const session = await accessToken(config);
  const count = await contextCount(config);
  const row = {
    user_id: session.user_id,
    name: String(value.name ?? "").trim(),
    icon: String(value.icon ?? "folder"),
    color: String(value.color ?? "#8CAABA"),
    sort_order: count
  };
  if (!row.name) throw new Error("请输入清单名称");
  const inserted = await rest<DbContext[]>(config, "hermes_contexts", { method: "POST", body: JSON.stringify(row) });
  return toContext(inserted[0]!, []);
}
async function createTask(config: CloudConfig, value: JsonObject): Promise<JsonObject> {
  const session = await accessToken(config);
  const row = {
    user_id: session.user_id,
    title: String(value.title ?? "").trim(),
    notes: value.notes ?? "",
    priority: value.priority ?? "medium",
    due_at: value.dueAt ?? null,
    context_id: value.contextId ?? null,
    parent_task_id: value.parentTaskId ?? null,
    repeat_interval: value.repeatInterval ?? "none",
    repeat_rule: value.repeatRule ?? ""
  };
  if (!row.title) throw new Error("请输入任务名称");
  const inserted = await rest<DbTask[]>(config, "hermes_tasks", { method: "POST", body: JSON.stringify(row) });
  return toTask(inserted[0]!, []);
}
async function commitAiSuggestions(config: CloudConfig, data: JsonObject): Promise<JsonObject> {
  const suggestions = Array.isArray(data.suggestions) ? data.suggestions as JsonObject[] : [];
  const existing = await rest<DbContext[]>(config, "hermes_contexts?select=*&order=sort_order.asc");
  const all = await allTasks(config);
  const createdTasks: JsonObject[] = [];
  let skippedCount = 0;
  for (const item of suggestions.slice(0, 40)) {
    const title = String(item.title ?? "").trim().slice(0, 200);
    const contextName = String(item.context ?? "AI 任务").trim().slice(0, 40);
    if (!title || !contextName) continue;
    let context = existing.find(c => c.name === contextName);
    if (!context) {
      const added = await createContext(config, { name: contextName, icon: "folder", color: "#8CAABA" });
      context = {
        id: String(added.id), name: contextName, icon: "folder", color: "#8CAABA",
        sort_order: existing.length, created_at: String(added.createdAt), updated_at: String(added.updatedAt)
      };
      existing.push(context);
    }
    if (all.some(t => t.context_id === context.id && t.title === title)) { skippedCount++; continue; }
    const newTask = await createTask(config, {
      title, notes: String(item.note ?? "").slice(0, 4000),
      priority: item.priority ?? "medium", contextId: context.id
    });
    createdTasks.push(newTask);
    all.push({ id: String(newTask.id), title, context_id: context.id } as DbTask);
  }
  return { createdTasks, skippedCount };
}
async function api(config: CloudConfig, endpoint: string, method: string, data: JsonObject, mockFallback: typeof window.fetch, input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (endpoint === "/api/session") {
    const token = await accessToken(config);
    const response = await fetchDirect(config.url + "/auth/v1/user", {
      headers: { apikey: config.publishableKey, Authorization: "Bearer " + token.access_token }
    });
    if (!response.ok) throw new Error("登录状态无效，请重新登录");
    return jsonResponse({ authenticated: true });
  }
  if (endpoint === "/api/auth/login" && method === "POST") {
    const email = String(data.email ?? "").trim();
    if (!email) throw new Error("请输入云端账户邮箱");
    const session = await publicAuth(config, "token?grant_type=password", { email, password: data.password });
    saveSession(config, session);
    return jsonResponse({ authenticated: true });
  }
  if (endpoint === "/api/auth/signup" && method === "POST") {
    const email = String(data.email ?? "").trim();
    const response = await publicAuth(config, "signup", { email, password: data.password });
    if (response.access_token) {
      saveSession(config, response);
      return jsonResponse({ authenticated: true, confirmationRequired: false });
    }
    return jsonResponse({ authenticated: false, confirmationRequired: true });
  }
  if (endpoint === "/api/auth/logout" && method === "POST") {
    const token = readSession(config);
    localStorage.removeItem(SESSION_KEY);
    if (token) {
      void fetchDirect(config.url + "/auth/v1/logout", {
        method: "POST", headers: { apikey: config.publishableKey, Authorization: "Bearer " + token.access_token }
      }).catch(() => undefined);
    }
    return jsonResponse(null, 204);
  }
  if (endpoint === "/api/contexts" && method === "GET") {
    const [contexts, tasks] = await Promise.all([
      rest<DbContext[]>(config, "hermes_contexts?select=*&order=sort_order.asc"),
      allTasks(config)
    ]);
    return jsonResponse(contexts.map(c => toContext(c, tasks)));
  }
  if (endpoint === "/api/contexts" && method === "POST") return jsonResponse(await createContext(config, data), 201);
  const cm = /^\/api\/contexts\/([^/]+)$/.exec(endpoint);
  if (cm) {
    const id = encodeURIComponent(cm[1]!);
    if (method === "PATCH") {
      const update = fields(data, contextFields);
      const changed = await rest<DbContext[]>(config, "hermes_contexts?id=eq." + id, { method: "PATCH", body: JSON.stringify(update) });
      if (!changed[0]) throw new Error("清单不存在");
      return jsonResponse(toContext(changed[0], await allTasks(config)));
    }
    if (method === "DELETE") {
      await rest(config, "hermes_contexts?id=eq." + id, { method: "DELETE" });
      return jsonResponse(null, 204);
    }
  }
  if (endpoint === "/api/tasks" && method === "GET") {
    const url = new URL(input instanceof Request ? input.url : String(input), location.href);
    return jsonResponse(await tasksForDisplay(config, url.searchParams));
  }
  if (endpoint === "/api/tasks" && method === "POST") return jsonResponse(await createTask(config, data), 201);
  const tm = /^\/api\/tasks\/([^/]+)(\/toggle)?$/.exec(endpoint);
  if (tm) {
    const id = encodeURIComponent(tm[1]!);
    if (tm[2] && method === "POST") {
      const old = await oneTask(config, tm[1]!);
      const update = {
        is_completed: !old.is_completed,
        completed_at: old.is_completed ? null : new Date().toISOString()
      };
      const changed = await rest<DbTask[]>(config, "hermes_tasks?id=eq." + id, { method: "PATCH", body: JSON.stringify(update) });
      return jsonResponse(toTask(changed[0]!, await allTasks(config)));
    }
    if (method === "PATCH") {
      const changed = await rest<DbTask[]>(config, "hermes_tasks?id=eq." + id, { method: "PATCH", body: JSON.stringify(fields(data, taskFields)) });
      if (!changed[0]) throw new Error("任务不存在");
      return jsonResponse(toTask(changed[0], await allTasks(config)));
    }
    if (method === "DELETE") {
      await rest(config, "hermes_tasks?id=eq." + id, { method: "DELETE" });
      return jsonResponse(null, 204);
    }
  }
  if ((endpoint === "/api/ai/plan" || endpoint === "/api/ai/import-list") && method === "POST") {
    // The public preview's existing offline AI sample remains clearly labelled as such.
    return mockFallback(input, init);
  }
  if (endpoint === "/api/ai/commit-suggestions" && method === "POST") {
    return jsonResponse(await commitAiSuggestions(config, data));
  }
  return jsonResponse({ error: { code: "NOT_IMPLEMENTED", message: "云端版暂不支持此操作" } }, 404);
}

/** Install on top of the offline preview's mock fetch; never fall back to local writes. */
export function installCloudBridge(): boolean {
  const config = readCloudConfig();
  if (!config) return false;
  const mockFallback = window.fetch.bind(window);
  fetchDirect = window.fetch.bind(window);
  // The underlying preview mock is not appropriate for Supabase Auth/REST requests:
  // it only handles local /api URLs and forwards all external origins untouched.
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = new URL(input instanceof Request ? input.url : String(input), location.href);
    if (url.origin !== location.origin || !url.pathname.startsWith("/api/")) return fetchDirect(input, init);
    const endpoint = url.pathname;
    const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
    try {
      return await api(config, endpoint, method, requestBody(init), mockFallback, input, init);
    } catch (error) {
      const message = error instanceof Error ? error.message : "云端操作失败";
      const unauthorized = /请先登录|登录已过期|登录状态无效/.test(message);
      return jsonResponse({ error: { code: unauthorized ? "UNAUTHORIZED" : "CLOUD_ERROR", message } }, unauthorized ? 401 : 400);
    }
  };
  return true;
}
