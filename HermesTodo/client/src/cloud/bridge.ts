/**
 * Browser-only Supabase adapter for the public GitHub Pages build.
 * Maps the existing HermesTodo JSON API onto PostgREST and Supabase Auth.
 * All database access is scoped by Supabase RLS; no privileged key is used.
 */
import { DEMO_DATA_KEY, readCloudConfig, type CloudConfig } from "./config";

type JsonObject = Record<string, unknown>;
type Session = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user_id: string;
  project_url: string;
};
type DbList = {
  id: string; name: string; icon: string; color: string; sort_order: number;
  created_at: string; updated_at: string;
};
type DbContext = {
  id: string; name: string; icon: string; color: string; sort_order: number;
  list_id: string | null;
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

async function edgeCall<T>(config: CloudConfig, functionName: string, body: JsonObject): Promise<T> {
  const session = await accessToken(config);
  const response = await fetchDirect(config.url + "/functions/v1/" + functionName, {
    method: "POST",
    headers: {
      apikey: config.publishableKey,
      Authorization: "Bearer " + session.access_token,
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({})) as T & JsonObject;
  if (!response.ok) throw serverError(data, "云端函数调用失败");
  return data;
}

/** Parse a verified Supabase user from an existing bearer token, never from untrusted link claims. */
async function persistLinkSession(config: CloudConfig, tokens: JsonObject): Promise<void> {
  const bearer = String(tokens.access_token ?? "");
  const refresh = String(tokens.refresh_token ?? "");
  if (!bearer || !refresh) throw new Error("邮件链接中没有有效的登录凭证");
  const userResponse = await fetchDirect(config.url + "/auth/v1/user", {
    headers: { apikey: config.publishableKey, Authorization: "Bearer " + bearer }
  });
  if (!userResponse.ok) throw new Error("邮件登录凭证无效或已过期，请重新发送登录邮件");
  const user = await userResponse.json() as { id?: string };
  if (!user.id) throw new Error("无法确认当前登录账户");
  saveSession(config, { ...tokens, user, expires_in: Number(tokens.expires_in ?? 3600) });
}

/** Handle a real hosted magic-link callback before React's HashRouter starts. */
export async function acceptCloudRedirect(): Promise<void> {
  const config = readCloudConfig();
  if (!config) return;
  const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
  if (!hash.has("access_token") || !hash.has("refresh_token")) return;
  const data: JsonObject = {
    access_token: hash.get("access_token"),
    refresh_token: hash.get("refresh_token"),
    expires_in: Number(hash.get("expires_in") ?? 3600)
  };
  try {
    await persistLinkSession(config, data);
  } finally {
    // Remove sensitive authentication tokens from the URL even on failure.
    history.replaceState(null, "", location.pathname + location.search + "#/");
  }
}

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
    listId: c.list_id,
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
const contextFields = { name: "name", icon: "icon", color: "color", sortOrder: "sort_order", listId: "list_id" };
const listFields = { name: "name", icon: "icon", color: "color", sortOrder: "sort_order" };
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
async function allLists(config: CloudConfig): Promise<DbList[]> {
  return rest<DbList[]>(config, "hermes_lists?select=*&order=sort_order.asc,created_at.asc");
}
function toList(list: DbList, contexts: DbContext[], tasks: DbTask[]) {
  const sceneIds = new Set(contexts.filter(c => c.list_id === list.id).map(c => c.id));
  return {
    id: list.id, name: list.name, icon: list.icon, color: list.color, sortOrder: list.sort_order,
    createdAt: list.created_at, updatedAt: list.updated_at,
    sceneCount: sceneIds.size,
    incompleteCount: tasks.filter(t => t.context_id && sceneIds.has(t.context_id) && !t.is_completed).length
  };
}
async function createList(config: CloudConfig, value: JsonObject): Promise<JsonObject> {
  const session = await accessToken(config);
  const existing = await allLists(config);
  const row = {
    user_id: session.user_id,
    name: String(value.name ?? "").trim(),
    icon: String(value.icon ?? "compass"),
    color: String(value.color ?? "#8CAABA"),
    sort_order: existing.length
  };
  if (!row.name) throw new Error("请输入清单名称");
  const inserted = await rest<DbList[]>(config, "hermes_lists", { method: "POST", body: JSON.stringify(row) });
  return toList(inserted[0]!, [], []);
}

const LEGACY_MIGRATION_PREFIX = "hermestodo-legacy-cloud-migrated-v1:";
const demoContextNames = new Set(["工作项目","个人生活","创作灵感"]);
const demoTaskTitles = new Set([
  "记下一个临时想法","买咖啡豆","检查 HermesTodo 新版交互",
  "整理下一阶段产品需求","记录一个新创作想法","处理前几天未完成的任务"
]);

async function migrateLegacyLocalData(config: CloudConfig): Promise<void> {
  const session = await accessToken(config);
  const migrationKey = LEGACY_MIGRATION_PREFIX + session.user_id;
  if (localStorage.getItem(migrationKey) === "1") return;

  let legacy: { contexts?: JsonObject[]; tasks?: JsonObject[] } | null = null;
  try {
    const raw = localStorage.getItem(DEMO_DATA_KEY);
    if (raw) legacy = JSON.parse(raw) as { contexts?: JsonObject[]; tasks?: JsonObject[] };
  } catch {}
  if (!legacy || !Array.isArray(legacy.contexts) || !Array.isArray(legacy.tasks)) {
    localStorage.setItem(migrationKey, "1");
    return;
  }

  const legacyContexts = legacy.contexts.filter((item) => {
    const name = String(item.name ?? "").trim();
    const id = String(item.id ?? "");
    return name && !(["work","life","creative"].includes(id) && demoContextNames.has(name));
  });
  const legacyTasks = legacy.tasks.filter((item) => {
    const title = String(item.title ?? "").trim();
    return title && !demoTaskTitles.has(title);
  });
  if (!legacyContexts.length && !legacyTasks.length) {
    localStorage.setItem(migrationKey, "1");
    return;
  }

  const cloudContexts = await rest<DbContext[]>(config, "hermes_contexts?select=*&order=sort_order.asc");
  const cloudTasks = await allTasks(config);
  const contextByName = new Map(cloudContexts.map((item) => [item.name.trim(), item]));
  const contextIdMap = new Map<string,string>();

  for (const old of legacyContexts) {
    const oldId = String(old.id ?? "");
    const name = String(old.name ?? "").trim().slice(0,40);
    if (!oldId || !name) continue;
    let target = contextByName.get(name);
    if (!target) {
      const created = await createContext(config, {
        name,
        icon: String(old.icon ?? "folder").slice(0,40),
        color: /^#[0-9a-fA-F]{6}$/.test(String(old.color ?? "")) ? old.color : "#8CAABA"
      });
      target = {
        id: String(created.id), name, icon: String(created.icon), color: String(created.color),
        sort_order: Number(created.sortOrder ?? contextByName.size),
        list_id: created.listId ? String(created.listId) : null,
        created_at: String(created.createdAt), updated_at: String(created.updatedAt)
      };
      contextByName.set(name,target);
    }
    contextIdMap.set(oldId,target.id);
  }

  // Also map unchanged demo context IDs when a user task was filed into one of them.
  for (const old of legacy.contexts) {
    const oldId=String(old.id ?? "");
    if (contextIdMap.has(oldId)) continue;
    const name=String(old.name ?? "").trim();
    const target=contextByName.get(name);
    if (target) contextIdMap.set(oldId,target.id);
  }

  const existingKeys = new Set(cloudTasks.map((task) => `${task.context_id ?? ""}\u0000${task.title.trim()}`));
  const taskIdMap = new Map<string,string>();
  const roots = legacyTasks.filter((item) => !item.parentTaskId);
  const children = legacyTasks.filter((item) => item.parentTaskId);

  async function migrateTask(old: JsonObject, parentTaskId: string | null) {
    const title = String(old.title ?? "").trim().slice(0,200);
    if (!title) return;
    const contextId = parentTaskId ? null : (old.contextId ? contextIdMap.get(String(old.contextId)) ?? null : null);
    const dedupe = `${contextId ?? ""}\u0000${title}`;
    if (existingKeys.has(dedupe) && !parentTaskId) return;
    const created = await createTask(config, {
      title,
      notes: String(old.notes ?? "").slice(0,4000),
      priority: old.priority === "high" || old.priority === "low" ? old.priority : "medium",
      dueAt: typeof old.dueAt === "string" ? old.dueAt : null,
      contextId,
      parentTaskId,
      repeatInterval: ["none","daily","weekly","monthly","yearly","custom"].includes(String(old.repeatInterval)) ? old.repeatInterval : "none",
      repeatRule: String(old.repeatRule ?? "").slice(0,100)
    });
    taskIdMap.set(String(old.id ?? ""), String(created.id));
    existingKeys.add(dedupe);
    if (old.isCompleted) {
      await rest<DbTask[]>(config, "hermes_tasks?id=eq." + encodeURIComponent(String(created.id)), {
        method:"PATCH",
        body:JSON.stringify({is_completed:true, completed_at: typeof old.completedAt === "string" ? old.completedAt : new Date().toISOString()})
      });
    }
  }

  for (const old of roots) await migrateTask(old,null);
  for (const old of children) {
    const parent = taskIdMap.get(String(old.parentTaskId ?? ""));
    if (parent) await migrateTask(old,parent);
  }

  localStorage.setItem(migrationKey, "1");
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
async function contextCount(config: CloudConfig, listId?: string | null): Promise<number> {
  const endpoint = listId
    ? "hermes_contexts?select=id&list_id=eq." + encodeURIComponent(listId)
    : "hermes_contexts?select=id";
  const contexts = await rest<DbContext[]>(config, endpoint);
  return contexts.length;
}
async function createContext(config: CloudConfig, value: JsonObject): Promise<JsonObject> {
  const session = await accessToken(config);
  let listId = value.listId ? String(value.listId) : "";
  if (!listId) {
    const lists = await allLists(config);
    if (lists[0]) listId = lists[0].id;
    else {
      const created = await createList(config, { name: "默认清单", icon: "compass", color: "#8CAABA" });
      listId = String(created.id);
    }
  }
  const count = await contextCount(config, listId);
  const row = {
    user_id: session.user_id,
    list_id: listId,
    name: String(value.name ?? "").trim(),
    icon: String(value.icon ?? "folder"),
    color: String(value.color ?? "#8CAABA"),
    sort_order: count
  };
  if (!row.name) throw new Error("请输入场景名称");
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
        sort_order: existing.length, list_id: added.listId ? String(added.listId) : null,
        created_at: String(added.createdAt), updated_at: String(added.updatedAt)
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
    await migrateLegacyLocalData(config);
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
  if (endpoint === "/api/auth/magic-send" && method === "POST") {
    const email = String(data.email ?? "").trim();
    if (!email || !email.includes("@")) throw new Error("请输入有效的邮箱地址");
    // An existing account is required: no duplicate accounts or insecure shared logins.
    const redirect = location.origin + String(import.meta.env.BASE_URL);
    await publicAuth(config, "otp?redirect_to=" + encodeURIComponent(redirect), {
      email, create_user: false
    });
    return jsonResponse({ sent: true });
  }
  if (endpoint === "/api/auth/magic-accept" && method === "POST") {
    const inputUrl = String(data.link ?? "").trim();
    if (!inputUrl || inputUrl.length > 5000) throw new Error("请粘贴完整的登录邮件链接");
    let url: URL;
    try { url = new URL(inputUrl); } catch { throw new Error("邮件链接不是有效的网址"); }
    if (url.protocol !== "https:" || url.origin !== config.url || url.pathname !== "/auth/v1/verify") {
      throw new Error("只能使用当前 Supabase 项目发出的原始验证链接");
    }
    const type = url.searchParams.get("type");
    if (type !== "magiclink" && type !== "email") throw new Error("这不是可用于登录的邮件链接");
    const hash = url.searchParams.get("token") ?? url.searchParams.get("token_hash");
    if (!hash || hash.length < 20) throw new Error("邮件链接缺少有效的验证令牌");
    // Verification consumes the one-time link without following its localhost redirect.
    const token = await publicAuth(config, "verify", {
      token_hash: hash,
      type
    });
    saveSession(config, token);
    return jsonResponse({ authenticated: true });
  }
  if (endpoint === "/api/auth/recover-redirect" && method === "POST") {
    const pasted = String(data.redirectedUrl ?? "").trim();
    if (!pasted || pasted.length > 12000) throw new Error("请粘贴上次 localhost 错误页面地址栏中的完整网址");
    let url: URL;
    try { url = new URL(pasted); } catch { throw new Error("请输入浏览器地址栏中的完整网址"); }
    // Only an explicitly user-pasted redirected URL is accepted. No network request
    // ever goes to localhost, and tokens are verified with the configured project.
    const isLocal = url.protocol === "http:" && url.hostname === "localhost" && url.port === "3000";
    const isOurSite = url.protocol === "https:" && url.origin === location.origin &&
      url.pathname.startsWith(String(import.meta.env.BASE_URL));
    const isSupabaseLink = url.protocol === "https:" && url.origin === config.url && url.pathname === "/auth/v1/verify";
    if (isSupabaseLink) {
      const type = url.searchParams.get("type");
      const hash = url.searchParams.get("token") ?? url.searchParams.get("token_hash");
      if ((type !== "magiclink" && type !== "email") || !hash || hash.length < 20) {
        throw new Error("邮件链接缺少有效的验证令牌");
      }
      const token = await publicAuth(config, "verify", { token_hash: hash, type });
      saveSession(config, token);
      return jsonResponse({ authenticated: true });
    }
    if (!isLocal && !isOurSite) throw new Error("只能使用上次 localhost:3000、HermesTodo 或当前 Supabase 的登录链接");
    const fragment = url.hash.replace(/^#\/?/, "");
    const params = new URLSearchParams(fragment);
    const access = params.get("access_token");
    const refresh = params.get("refresh_token");
    const expires = Number(params.get("expires_in") ?? 3600);
    if (!access || !refresh) throw new Error("此地址没有登录凭证。请确认复制的是邮件跳转后浏览器地址栏的完整网址（包含 #access_token）。");
    await persistLinkSession(config, {
      access_token: access, refresh_token: refresh,
      expires_in: Number.isFinite(expires) && expires > 0 ? expires : 3600
    });
    return jsonResponse({ authenticated: true });
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
  if (endpoint === "/api/lists" && method === "GET") {
    const [lists, contexts, tasks] = await Promise.all([
      allLists(config),
      rest<DbContext[]>(config, "hermes_contexts?select=*&order=sort_order.asc"),
      allTasks(config)
    ]);
    return jsonResponse(lists.map(item => toList(item, contexts, tasks)));
  }
  if (endpoint === "/api/lists" && method === "POST") {
    return jsonResponse(await createList(config, data), 201);
  }
  if (endpoint === "/api/lists/reorder" && method === "POST") {
    const ids = Array.isArray(data.orderedIds) ? data.orderedIds.map(String) : [];
    const known = new Set((await allLists(config)).map(item => item.id));
    if (ids.length !== known.size || ids.some(id => !known.has(id))) throw new Error("清单排序数据无效");
    for (let index = 0; index < ids.length; index += 1) {
      await rest<DbList[]>(config, "hermes_lists?id=eq." + encodeURIComponent(ids[index]!), {
        method: "PATCH", body: JSON.stringify({ sort_order: index, updated_at: new Date().toISOString() })
      });
    }
    return jsonResponse({ ok: true });
  }
  const lcm = /^\/api\/lists\/([^/]+)\/complete$/.exec(endpoint);
  if (lcm && method === "POST") {
    const listId = lcm[1]!;
    const [contexts, tasks] = await Promise.all([
      rest<DbContext[]>(config, "hermes_contexts?select=*&list_id=eq." + encodeURIComponent(listId)),
      allTasks(config)
    ]);
    const sceneIds = new Set(contexts.map(item => item.id));
    const rootIds = new Set(tasks.filter(task => task.context_id && sceneIds.has(task.context_id)).map(task => task.id));
    const ids = tasks
      .filter(task => !task.is_completed && (
        (task.context_id && sceneIds.has(task.context_id)) ||
        (task.parent_task_id && rootIds.has(task.parent_task_id))
      ))
      .map(task => task.id);
    if (ids.length) {
      await rest<DbTask[]>(config, "hermes_tasks?id=in.(" + ids.join(",") + ")", {
        method: "PATCH",
        body: JSON.stringify({ is_completed: true, completed_at: new Date().toISOString() })
      });
    }
    return jsonResponse({ updatedCount: ids.length });
  }
  const lm = /^\/api\/lists\/([^/]+)$/.exec(endpoint);
  if (lm) {
    const id = encodeURIComponent(lm[1]!);
    if (method === "PATCH") {
      const changed = await rest<DbList[]>(config, "hermes_lists?id=eq." + id, {
        method: "PATCH", body: JSON.stringify({ ...fields(data, listFields), updated_at: new Date().toISOString() })
      });
      if (!changed[0]) throw new Error("清单不存在");
      const [contexts, tasks] = await Promise.all([
        rest<DbContext[]>(config, "hermes_contexts?select=*&order=sort_order.asc"),
        allTasks(config)
      ]);
      return jsonResponse(toList(changed[0], contexts, tasks));
    }
    if (method === "DELETE") {
      await rest(config, "hermes_lists?id=eq." + id, { method: "DELETE" });
      return jsonResponse(null, 204);
    }
  }
  if (endpoint === "/api/contexts" && method === "GET") {
    const url = new URL(input instanceof Request ? input.url : String(input), location.href);
    const listId = url.searchParams.get("listId");
    const contextEndpoint = listId
      ? "hermes_contexts?select=*&list_id=eq." + encodeURIComponent(listId) + "&order=sort_order.asc"
      : "hermes_contexts?select=*&order=sort_order.asc";
    const [contexts, tasks] = await Promise.all([
      rest<DbContext[]>(config, contextEndpoint),
      allTasks(config)
    ]);
    return jsonResponse(contexts.map(item => toContext(item, tasks)));
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
  if (endpoint === "/api/ai/plan" && method === "POST") {
    return jsonResponse(await edgeCall<JsonObject>(config, "hermestodo-ai", { action: "plan", messages: data.messages }));
  }
  if (endpoint === "/api/ai/import-list" && method === "POST") {
    return jsonResponse(await edgeCall<JsonObject>(config, "hermestodo-ai", {
      action: "import", raw: data.raw, contextHint: data.contextHint, messages: data.messages
    }));
  }
  if (endpoint === "/api/data/export" && method === "GET") {
    return jsonResponse(await edgeCall<JsonObject>(config, "hermestodo-data", { action: "export" }));
  }
  if (endpoint === "/api/data/import" && method === "POST") {
    return jsonResponse(await edgeCall<JsonObject>(config, "hermestodo-data", { action: "import", payload: data.payload }));
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
