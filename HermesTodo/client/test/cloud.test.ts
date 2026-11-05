// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CLOUD_CONFIG_KEY, clearCloudConfig, isCloudMode, readCloudConfig, saveCloudConfig } from "../src/cloud/config";
import { installCloudBridge } from "../src/cloud/bridge";

const project = "https://sample-project.supabase.co";
const publishable = "sb_publishable_test_environment_key_only";
const now = Math.floor(Date.now() / 1000);

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe("public Supabase setup", () => {
  it("keeps local mode until explicitly configured", () => {
    expect(readCloudConfig()).toBeNull();
    expect(installCloudBridge()).toBe(false);
    expect(isCloudMode()).toBe(false); // Vitest is not the static preview build.
  });
  it("rejects private project credentials and HTTP URLs", () => {
    expect(() => saveCloudConfig("http://sample-project.supabase.co", publishable)).toThrow();
    expect(() => saveCloudConfig(project, "sb_secret_private")).toThrow();
    expect(() => saveCloudConfig(project, "service_role_admin")).toThrow();
    expect(localStorage.getItem(CLOUD_CONFIG_KEY)).toBeNull();
  });
  it("persists only the public project URL and publishable key", () => {
    saveCloudConfig(project, publishable);
    expect(readCloudConfig()).toEqual({ url: project, publishableKey: publishable });
    clearCloudConfig();
    expect(readCloudConfig()).toBeNull();
  });
});

describe("browser cloud bridge", () => {
  it("reads account-scoped tasks through authenticated Supabase REST", async () => {
    saveCloudConfig(project, publishable);
    localStorage.setItem("hermestodo-supabase-session-v1", JSON.stringify({
      access_token: "user-jwt", refresh_token: "refresh", expires_at: now + 3600,
      user_id: "user-123", project_url: project
    }));
    const network = vi.fn(async (input: string | URL | Request) => {
      const request = String(input);
      if (request === project + "/rest/v1/hermes_task_checkins?select=task_id,cycle_at,completed_at") {
        return new Response("[]", {status:200,headers:{"content-type":"application/json"}});
      }
      if (request === project + "/rest/v1/hermes_tasks?select=*&order=created_at.desc") {
        return new Response(JSON.stringify([{
          id: "task-1", title: "云端待办", notes: "", priority: "medium",
          due_at: null, is_completed: false, completed_at: null, context_id: null,
          parent_task_id: null, repeat_interval: "none", repeat_rule: "",
          created_at: "2026-10-26T01:00:00Z", updated_at: "2026-10-26T01:00:00Z"
        }]), { status: 200, headers: { "content-type": "application/json" } });
      }
      throw new Error("Unexpected cloud request: " + request);
    });
    vi.stubGlobal("fetch", network);
    expect(installCloudBridge()).toBe(true);
    const res = await fetch("/api/tasks?scope=inbox");
    expect(res.status).toBe(200);
    const tasks = await res.json() as Array<{ title: string; subtasks: unknown[] }>;
    expect(tasks).toMatchObject([{ title: "云端待办", subtasks: [] }]);
    expect(network).toHaveBeenCalledTimes(2);
    const options = network.mock.calls.find(([url])=>String(url).includes("hermes_tasks?")) as unknown as [string, RequestInit];
    expect(options[1].headers).toMatchObject({
      apikey: publishable,
      Authorization: "Bearer user-jwt"
    });
  });
  it("handles existing Postgres +00:00 checkins and safely reverses/reattaches them", async () => {
    saveCloudConfig(project, publishable);
    localStorage.setItem("hermestodo-supabase-session-v1", JSON.stringify({
      access_token:"user-jwt",refresh_token:"refresh",expires_at:now+3600,
      user_id:"owner-1",project_url:project
    }));
    const cycle=new Date(Date.now()-60_000).toISOString();
    const postgresCycle=cycle.replace(/Z$/, "+00:00");
    const task={
      id:"task-1",title:"月度对账",notes:"",priority:"medium",
      due_at:cycle,is_completed:false,completed_at:null,context_id:null,
      parent_task_id:null,repeat_interval:"monthly",repeat_rule:"",
      created_at:cycle,updated_at:cycle
    };
    const records: Array<{task_id:string;cycle_at:string;completed_at:string}>=[
      {task_id:"task-1",cycle_at:postgresCycle,completed_at:new Date().toISOString()}
    ];
    const network=vi.fn(async (input:string | URL | Request,init?:RequestInit) => {
      const url=String(input);
      const method=init?.method??"GET";
      const ok=(value:unknown)=>new Response(JSON.stringify(value),{
        status:200,headers:{"content-type":"application/json"}
      });
      if(url.includes("/hermes_tasks?select="))return ok([task]);
      if(url.includes("/hermes_task_checkins")) {
        if(method==="GET")return ok([...records]);
        if(method==="DELETE"){
          records.length=0;
          return new Response(null,{status:204});
        }
        if(method==="POST"){
          expect(url).toContain("on_conflict=user_id,task_id,cycle_at");
          expect((init?.headers as Record<string,string>).Prefer)
            .toBe("return=minimal,resolution=ignore-duplicates");
          const payload=JSON.parse(String(init?.body));
          if(!records.some(item=>item.task_id===payload.task_id&&
             Date.parse(item.cycle_at)===Date.parse(payload.cycle_at))){
            records.push({...payload});
          }
          return new Response(null,{status:204});
        }
      }
      throw new Error("Unexpected REST request "+method+" "+url);
    });
    vi.stubGlobal("fetch",network);
    expect(installCloudBridge()).toBe(true);

    // A checkin already exists in Supabase's +00:00 representation:
    // clicking a checked task must DELETE, not try a duplicate POST.
    const undone=await fetch("/api/tasks/task-1/toggle",{method:"POST"});
    expect(undone.status).toBe(200);
    expect(await undone.json()).toMatchObject({isCompleted:false,checkinCount:0});
    expect(network.mock.calls.filter(([,options])=>options?.method==="POST")).toHaveLength(0);

    // Rechecking inserts exactly one new checkin using conflict-safe semantics.
    const redone=await fetch("/api/tasks/task-1/toggle",{method:"POST"});
    expect(redone.status).toBe(200);
    expect(await redone.json()).toMatchObject({isCompleted:true,checkinCount:1});
    expect(records).toHaveLength(1);
    expect(network.mock.calls.filter(([,options])=>options?.method==="POST")).toHaveLength(1);
    expect(new Date(records[0].cycle_at).getTime()).toBe(new Date(cycle).getTime());
  });

  it("updates a known nonrecurring checkbox with exactly one REST PATCH and no preflight GET",async()=>{
    saveCloudConfig(project,publishable);
    localStorage.setItem("hermestodo-supabase-session-v1",JSON.stringify({
      access_token:"user-jwt",refresh_token:"refresh",expires_at:now+3600,
      user_id:"owner-1",project_url:project
    }));
    const network=vi.fn(async(url:string|URL|Request,init?:RequestInit)=>{
      expect(String(url)).toBe(project+"/rest/v1/hermes_tasks?id=eq.task-1");
      expect(init?.method).toBe("PATCH");
      expect(JSON.parse(String(init?.body))).toMatchObject({
        is_completed:true
      });
      return new Response(JSON.stringify([{
        id:"task-1",is_completed:true,completed_at:"2026-11-05T10:30:00.000Z"
      }]),{status:200,headers:{"content-type":"application/json"}});
    });
    vi.stubGlobal("fetch",network);
    expect(installCloudBridge()).toBe(true);
    const response=await fetch("/api/tasks/task-1/toggle",{method:"POST",body:JSON.stringify({
      desiredCompleted:true,recurring:false,cycleAt:null
    })});
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({id:"task-1",isCompleted:true});
    expect(network).toHaveBeenCalledTimes(1);
  });

  it("checks a known recurring task in one REST write without querying the entire checklist",async()=>{
    saveCloudConfig(project,publishable);
    localStorage.setItem("hermestodo-supabase-session-v1",JSON.stringify({
      access_token:"user-jwt",refresh_token:"refresh",expires_at:now+3600,
      user_id:"owner-1",project_url:project
    }));
    const cycle="2026-11-05T10:30:00.000Z";
    const network=vi.fn(async(url:string|URL|Request,init?:RequestInit)=>{
      expect(String(url)).toContain("/hermes_task_checkins?on_conflict=");
      expect(init?.method).toBe("POST");
      expect((init?.headers as Record<string,string>).Prefer).toBe("return=minimal,resolution=ignore-duplicates");
      const body=JSON.parse(String(init?.body));
      expect(body).toMatchObject({
        user_id:"owner-1",task_id:"task-1",cycle_at:cycle
      });
      return new Response(null,{status:204});
    });
    vi.stubGlobal("fetch",network);
    expect(installCloudBridge()).toBe(true);
    const response=await fetch("/api/tasks/task-1/toggle",{method:"POST",body:JSON.stringify({
      desiredCompleted:true,recurring:true,cycleAt:cycle
    })});
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({id:"task-1",isCompleted:true});
    expect(network).toHaveBeenCalledTimes(1);
  });

  it("never falls back to demo data when signed out from cloud", async () => {
    saveCloudConfig(project, publishable);
    const network = vi.fn(async () => { throw new Error("Must not contact network"); });
    vi.stubGlobal("fetch", network);
    expect(installCloudBridge()).toBe(true);
    const response = await fetch("/api/contexts");
    expect(response.status).toBe(401);
    expect(network).not.toHaveBeenCalled();
  });
});

describe("passwordless email login", () => {
  it("requests login for existing account only, without sending a password", async () => {
    saveCloudConfig(project, publishable);
    const network = vi.fn(async (_url: string, _init?: RequestInit) =>
      new Response(JSON.stringify({}), { status: 200, headers: { "content-type": "application/json" } })
    );
    vi.stubGlobal("fetch", network);
    installCloudBridge();
    const response = await fetch("/api/auth/magic-send", {
      method: "POST", body: JSON.stringify({ email: "existing@example.org" })
    });
    expect(response.status).toBe(200);
    const args = network.mock.calls[0] as [string, RequestInit];
    expect(args[0]).toContain(project + "/auth/v1/otp?");
    expect(JSON.parse(String(args[1].body))).toMatchObject({
      email: "existing@example.org", create_user: false
    });
    expect(String(args[1].body)).not.toContain("password");
  });

  it("verifies an original email link without visiting localhost and persists session", async () => {
    saveCloudConfig(project, publishable);
    const tokenHash = "a".repeat(64);
    const link = project + "/auth/v1/verify?token=" + tokenHash +
      "&type=magiclink&redirect_to=http%3A%2F%2Flocalhost%3A3000";
    const network = vi.fn(async (url: string, init?: RequestInit) => {
      expect(url).toBe(project + "/auth/v1/verify");
      expect(init?.method).toBe("POST");
      expect(JSON.parse(String(init?.body))).toEqual({ token_hash: tokenHash, type: "magiclink" });
      return new Response(JSON.stringify({
        access_token: "private-user-jwt", refresh_token: "private-refresh-token",
        expires_in: 3600, user: { id: "a-correct-user-id" }
      }), { status: 200, headers: { "content-type": "application/json" } });
    });
    vi.stubGlobal("fetch", network);
    installCloudBridge();
    const response = await fetch("/api/auth/magic-accept", {
      method: "POST", body: JSON.stringify({ link })
    });
    expect(response.status).toBe(200);
    expect(network).toHaveBeenCalledTimes(1);
    const session = JSON.parse(localStorage.getItem("hermestodo-supabase-session-v1") ?? "null");
    expect(session).toMatchObject({
      access_token: "private-user-jwt", user_id: "a-correct-user-id", project_url: project
    });
    expect(session.expires_at).toBeGreaterThan(now);
  });

  it("rejects copied links from untrusted or unrelated domains", async () => {
    saveCloudConfig(project, publishable);
    const network = vi.fn(async () => { throw new Error("Network access must not happen"); });
    vi.stubGlobal("fetch", network);
    installCloudBridge();
    const response = await fetch("/api/auth/magic-accept", {
      method: "POST", body: JSON.stringify({
        link: "https://malicious.example.org/auth/v1/verify?token=" + "a".repeat(64) + "&type=magiclink"
      })
    });
    expect(response.status).toBe(400);
    expect(network).not.toHaveBeenCalled();
  });
});

describe("recover a verified session without sending another email", () => {
  it("restores a session from the existing localhost auth redirect", async () => {
    saveCloudConfig(project, publishable);
    const network = vi.fn(async (url: string, opts?: RequestInit) => {
      expect(url).toBe(project + "/auth/v1/user");
      expect(opts?.headers).toMatchObject({ Authorization: "Bearer existing-access-token" });
      return new Response(JSON.stringify({ id: "confirmed-owner-id" }), { status: 200,
        headers: { "content-type": "application/json" } });
    });
    vi.stubGlobal("fetch", network);
    expect(installCloudBridge()).toBe(true);
    const failedBrowserUrl = "http://localhost:3000/#access_token=existing-access-token" +
      "&refresh_token=existing-refresh-token&expires_in=3600&token_type=bearer";
    const result = await fetch("/api/auth/recover-redirect", {
      method: "POST", body: JSON.stringify({ redirectedUrl: failedBrowserUrl })
    });
    expect(result.status).toBe(200);
    expect(network).toHaveBeenCalledTimes(1);
    expect(JSON.parse(localStorage.getItem("hermestodo-supabase-session-v1") ?? "null"))
      .toMatchObject({ user_id: "confirmed-owner-id", access_token: "existing-access-token" });
  });

  it("can use an unconsumed previously sent Supabase verification link", async () => {
    saveCloudConfig(project, publishable);
    const rawLink = project + "/auth/v1/verify?token=" + "b".repeat(64) +
      "&type=magiclink&redirect_to=http%3A%2F%2Flocalhost%3A3000";
    const network = vi.fn(async (url: string) => {
      expect(url).toBe(project + "/auth/v1/verify");
      return new Response(JSON.stringify({
        access_token: "real-user-access", refresh_token: "real-user-refresh",
        expires_in: 3600, user: { id: "verified-owner" }
      }), { status: 200, headers: { "content-type": "application/json" } });
    });
    vi.stubGlobal("fetch", network);
    installCloudBridge();
    const res = await fetch("/api/auth/recover-redirect", {
      method: "POST", body: JSON.stringify({ redirectedUrl: rawLink })
    });
    expect(res.status).toBe(200);
    expect(network).toHaveBeenCalledTimes(1);
  });

  it("rejects unrelated websites and links with no issued session", async () => {
    saveCloudConfig(project, publishable);
    const network = vi.fn(async () => { throw new Error("Should not use the network"); });
    vi.stubGlobal("fetch", network);
    installCloudBridge();
    for (const redirectedUrl of [
      "https://evil.test/#access_token=evil&refresh_token=evil",
      "http://localhost:3000/",
      "http://localhost:3001/#access_token=foo&refresh_token=bar"
    ]) {
      const res = await fetch("/api/auth/recover-redirect", {
        method: "POST", body: JSON.stringify({ redirectedUrl })
      });
      expect(res.status).toBe(400);
    }
    expect(network).not.toHaveBeenCalled();
  });
});
