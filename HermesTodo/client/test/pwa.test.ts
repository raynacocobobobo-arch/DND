import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test, vi } from "vitest";

import { registerServiceWorker } from "../src/pwa/registerServiceWorker";

const clientRoot = resolve(import.meta.dirname, "..");

describe("PWA package", () => {
  test("declares standalone root metadata and both required icons", () => {
    const manifest = JSON.parse(readFileSync(resolve(clientRoot, "public/manifest.webmanifest"), "utf8"));
    expect(manifest).toMatchObject({
      name: "HermesTodo",
      short_name: "HermesTodo",
      start_url: "/",
      scope: "/",
      display: "standalone",
      background_color: "#F7F1E7",
      theme_color: "#F7F1E7"
    });
    expect(manifest.icons).toEqual(expect.arrayContaining([
      expect.objectContaining({ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }),
      expect.objectContaining({ src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" })
    ]));
    const html = readFileSync(resolve(clientRoot, "index.html"), "utf8");
    expect(html).toContain('rel="manifest" href="/manifest.webmanifest"');
    expect(html).toContain('rel="apple-touch-icon" href="/icons/icon-192.png"');
  });

  test.each([
    ["icon-192.png", 192],
    ["icon-512.png", 512]
  ])("ships a real %s with the declared dimensions", (filename, size) => {
    const image = readFileSync(resolve(clientRoot, "public/icons", filename));
    expect(image.subarray(1, 4).toString()).toBe("PNG");
    expect(image.readUInt32BE(16)).toBe(size);
    expect(image.readUInt32BE(20)).toBe(size);
  });

  test("registers the worker only in a secure context", async () => {
    const register = vi.fn(async () => ({}));
    const serviceWorker = { register } as unknown as ServiceWorkerContainer;

    await registerServiceWorker({ isSecureContext: false, serviceWorker });
    expect(register).not.toHaveBeenCalled();

    await registerServiceWorker({ isSecureContext: true, serviceWorker });
    expect(register).toHaveBeenCalledWith("/sw.js", { scope: "/" });
  });

  test("the worker caches only same-origin static assets and bypasses every API request", () => {
    const source = readFileSync(resolve(clientRoot, "public/sw.js"), "utf8");
    expect(source).toMatch(/pathname\.startsWith\("\/api\/"\)[\s\S]{0,100}return;/u);
    expect(source).toContain("request.destination");
    expect(source).toContain("url.origin !== self.location.origin");
    expect(source.match(/const APP_SHELL = \[([\s\S]*?)\];/u)?.[1]).not.toContain("/api/");
  });
});
