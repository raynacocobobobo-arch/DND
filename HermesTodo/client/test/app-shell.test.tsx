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

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function authenticatedFetch() {
  return vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const path = String(input);
    if (path === "/api/session") return jsonResponse({ authenticated: true });
    if (path === "/api/auth/logout" && init?.method === "POST") return jsonResponse(null, 204);
    if (path === "/api/contexts") return jsonResponse([
      { id: "example-id", name: "示例", icon: "folder", color: "#EEB0A8", sortOrder: 0, incompleteCount: 0, createdAt: "2026-10-25T00:00:00.000Z", updatedAt: "2026-10-25T00:00:00.000Z" }
    ]);
    if (path.startsWith("/api/tasks")) return jsonResponse([]);
    throw new Error(`Unexpected request: ${init?.method ?? "GET"} ${path}`);
  });
}

describe("responsive authenticated shell", () => {
  test("exposes the three main destinations and marks the active route", async () => {
    window.history.replaceState({}, "", "/contexts/example-id");
    vi.stubGlobal("fetch", authenticatedFetch());
    render(<App />);

    const navigation = await screen.findByRole("navigation", { name: "主导航" });
    expect(navigation).toBeInTheDocument();
    expect(navigation).toHaveClass("floating-tab-bar");
    expect(screen.getByRole("link", { name: "清单" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "收集箱" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "AI" })).not.toHaveAttribute("aria-current");
  });

  test("provides a keyboard skip link and a focusable main target", async () => {
    vi.stubGlobal("fetch", authenticatedFetch());
    render(<App />);

    expect(await screen.findByRole("link", { name: "跳到主要内容" })).toHaveAttribute("href", "#main-content");
    expect(document.getElementById("main-content")).toHaveAttribute("tabindex", "-1");
  });

  test("keeps the logout control in normal page flow so it cannot cover page-header actions", async () => {
    vi.stubGlobal("fetch", authenticatedFetch());
    render(<App />);

    const logout = await screen.findByRole("button", { name: "退出登录" });
    const main = document.getElementById("main-content");
    expect(main).toContainElement(logout);
  });

  test("logs out and returns to the password screen", async () => {
    const fetchMock = authenticatedFetch();
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByRole("button", { name: "退出登录" }));

    expect(await screen.findByLabelText("个人密码")).toBeInTheDocument();
    expect(fetchMock.mock.calls.some(([path, init]) => path === "/api/auth/logout" && init?.method === "POST")).toBe(true);
  });

  test("redirects an unknown route to the home page", async () => {
    window.history.replaceState({}, "", "/not-a-real-page");
    vi.stubGlobal("fetch", authenticatedFetch());
    render(<App />);

    expect(await screen.findByRole("heading", { name: "我的清单" })).toBeInTheDocument();
    await waitFor(() => expect(window.location.pathname).toBe("/"));
    expect(screen.getByRole("link", { name: "清单" })).toHaveAttribute("aria-current", "page");
  });
});
