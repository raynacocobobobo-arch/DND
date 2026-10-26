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
    expect(network).toHaveBeenCalledTimes(1);
    const options = network.mock.calls[0] as unknown as [string, RequestInit];
    expect(options[1].headers).toMatchObject({
      apikey: publishable,
      Authorization: "Bearer user-jwt"
    });
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
