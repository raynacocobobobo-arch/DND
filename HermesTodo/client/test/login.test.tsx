// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import { App } from "../src/App";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("login experience", () => {
  test("shows only the personal password form while unauthenticated", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ error: { code: "UNAUTHENTICATED" } }, 401)));

    render(<App />);

    expect(await screen.findByRole("heading", { name: "HermesTodo" })).toBeInTheDocument();
    expect(screen.getByLabelText("个人密码")).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "登录" })).toBeInTheDocument();
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(screen.queryByText("注册")).not.toBeInTheDocument();
  });

  test("announces an incorrect password accessibly", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ error: { code: "UNAUTHENTICATED" } }, 401))
      .mockResolvedValueOnce(
        jsonResponse({ error: { code: "INVALID_CREDENTIALS", message: "密码不正确" } }, 401)
      );
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<App />);

    await user.type(await screen.findByLabelText("个人密码"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "登录" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("密码不正确");
  });

  test("reveals the authenticated shell after login without persisting the password", async () => {
    let authenticated = false;
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      const path = String(input);
      if (path === "/api/session") return authenticated
        ? jsonResponse({ authenticated: true })
        : jsonResponse({ error: { code: "UNAUTHENTICATED" } }, 401);
      if (path === "/api/auth/login" && init?.method === "POST") {
        authenticated = true;
        return jsonResponse({ authenticated: true });
      }
      if (path === "/api/contexts" || path.startsWith("/api/tasks")) return jsonResponse([]);
      throw new Error(`Unexpected request: ${path}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const persist = vi.spyOn(Storage.prototype, "setItem");
    const user = userEvent.setup();
    render(<App />);

    const password = await screen.findByLabelText("个人密码");
    await user.type(password, "correct horse battery staple");
    await user.click(screen.getByRole("button", { name: "登录" }));

    expect(await screen.findByRole("navigation", { name: "主导航" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "清单" })).toBeInTheDocument();
    const loginCall = fetchMock.mock.calls.find(([path, init]) => path === "/api/auth/login" && init?.method === "POST");
    expect(JSON.parse(String(loginCall?.[1]?.body))).toEqual({
      password: "correct horse battery staple"
    });
    expect(persist).not.toHaveBeenCalled();
    expect(localStorage.length).toBe(0);
  });
});
