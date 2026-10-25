import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";
import YAML from "yaml";

const root = resolve(import.meta.dirname, "../..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("collision-safe deployment package", () => {
  test("publishes the single app container only on host loopback port 3020", () => {
    const compose = YAML.parse(read("compose.yaml")) as {
      services: Record<string, { ports?: string[]; volumes?: string[]; env_file?: string[] }>;
    };
    expect(Object.keys(compose.services)).toEqual(["app"]);
    expect(compose.services.app?.ports).toEqual(["127.0.0.1:3020:3000"]);
    expect(compose.services.app?.volumes).toEqual(expect.arrayContaining([
      "./data:/app/data",
      "./backups:/app/backups"
    ]));
    expect(compose.services.app?.env_file).toContain(".env");
    const serialized = JSON.stringify(compose);
    expect(serialized).not.toMatch(/(?:^|[^0-9])443(?::|[^0-9]|$)/u);
    expect(serialized).not.toMatch(/(?:^|[^0-9])7890(?::|[^0-9]|$)/u);
  });

  test("uses a dedicated Caddy service that listens only on HTTPS 8443 with its internal CA", () => {
    const caddyfile = read("deploy/Caddyfile");
    expect(caddyfile).toContain("https://82.156.85.52:8443");
    expect(caddyfile).toMatch(/tls\s+internal/u);
    expect(caddyfile).toContain("reverse_proxy 127.0.0.1:3020");
    expect(caddyfile).not.toMatch(/(?:^|[^0-9])443(?::|[^0-9]|$)/u);
    expect(caddyfile).not.toContain("7890");

    const service = read("deploy/hermestodo-caddy.service");
    expect(service).toContain("/home/ubuntu/hermestodo-web/deploy/Caddyfile");
    expect(service).toContain("--adapter caddyfile");
    expect(service).not.toContain("ACLI");
  });

  test("uses a multi-stage non-root runtime and contains no embedded password or API secret", () => {
    const dockerfile = read("Dockerfile");
    expect((dockerfile.match(/^FROM /gmu) ?? [])).toHaveLength(2);
    expect(dockerfile).toMatch(/^USER (?!root\b).+/mu);
    expect(dockerfile).toContain("EXPOSE 3000");

    const environment = read(".env.example");
    expect(environment).toMatch(/^AUTH_PASSWORD_HASH=$/mu);
    expect(environment).toMatch(/^SESSION_SECRET=$/mu);
    expect(environment).toMatch(/^ARK_API_KEY=$/mu);
    expect(environment).not.toMatch(/password\s*=\s*\S+/iu);
    expect(environment).not.toMatch(/ARK_API_KEY=\S+/u);
  });
});
