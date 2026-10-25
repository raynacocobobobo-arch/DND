import { z } from "zod";

const environmentSchema = z.object({
  AUTH_PASSWORD_HASH: z.string().min(20),
  SESSION_SECRET: z.string().min(32),
  COOKIE_SECURE: z.enum(["true", "false"]).default("true"),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(30),
  PUBLIC_ORIGIN: z.string().url().default("https://82.156.85.52:8443"),
  DATABASE_PATH: z.string().min(1).default("data/hermestodo.sqlite"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3020),
  ARK_API_KEY: z.string().min(1),
  ARK_ENDPOINT: z
    .string()
    .url()
    .default("https://ark.cn-beijing.volces.com/api/coding/v3/chat/completions"),
  ARK_MODEL: z.string().min(1).default("ark-code-latest")
});

export interface AppConfig {
  authPasswordHash: string;
  sessionSecret: string;
  cookieSecure: boolean;
  sessionTtlDays: number;
  publicOrigin: string;
  databasePath: string;
  port: number;
  arkApiKey: string;
  arkEndpoint: string;
  arkModel: string;
}

export function loadConfig(environment: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = environmentSchema.parse(environment);
  return {
    authPasswordHash: parsed.AUTH_PASSWORD_HASH,
    sessionSecret: parsed.SESSION_SECRET,
    cookieSecure: parsed.COOKIE_SECURE === "true",
    sessionTtlDays: parsed.SESSION_TTL_DAYS,
    publicOrigin: parsed.PUBLIC_ORIGIN.replace(/\/$/, ""),
    databasePath: parsed.DATABASE_PATH,
    port: parsed.PORT,
    arkApiKey: parsed.ARK_API_KEY,
    arkEndpoint: parsed.ARK_ENDPOINT,
    arkModel: parsed.ARK_MODEL
  };
}
