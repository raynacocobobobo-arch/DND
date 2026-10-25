import type Database from "better-sqlite3";
import express, { Router, type Express } from "express";
import { resolve } from "node:path";

import type { AppConfig } from "./config";
import type { ChatTurn } from "./ai/arkClient";
import type { AIPlanResult } from "../../shared/contracts";
import { originGuard } from "./middleware/originGuard";
import { requireAuth } from "./middleware/requireAuth";
import { createAuthRouter } from "./routes/auth";
import { createAIRouter } from "./routes/ai";
import { createContextsRouter } from "./routes/contexts";
import { createTasksRouter } from "./routes/tasks";

export type { AppConfig } from "./config";

export interface AppDependencies {
  db: Database.Database;
  config: Pick<
    AppConfig,
    "authPasswordHash" | "sessionSecret" | "cookieSecure" | "sessionTtlDays" | "publicOrigin"
  >;
  now?: () => Date;
  loginRateLimit?: { limit: number; windowMs: number };
  aiPlanner?: {
    requestPlan(
      history: ChatTurn[],
      fallback?: { raw: string; contextHint?: string }
    ): Promise<AIPlanResult>;
  };
  staticDirectory?: string;
}

export function createApp(dependencies: AppDependencies): Express {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "256kb" }));
  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok" });
  });
  app.use("/api", createAuthRouter(dependencies));

  const protectedRoutes = Router();
  protectedRoutes.use(requireAuth(dependencies));
  protectedRoutes.use(originGuard(dependencies.config.publicOrigin));
  protectedRoutes.use("/contexts", createContextsRouter(dependencies));
  protectedRoutes.use("/tasks", createTasksRouter(dependencies));
  protectedRoutes.use("/ai", createAIRouter(dependencies));
  app.use("/api", protectedRoutes);

  const staticDirectory = dependencies.staticDirectory ?? resolve(process.cwd(), "dist/client");
  app.use(
    express.static(staticDirectory, {
      index: false,
      setHeaders(response, path) {
        if (path.endsWith("/sw.js") || path.endsWith("/index.html")) {
          response.setHeader("Cache-Control", "no-cache");
        }
      }
    })
  );
  app.use((request, response, next) => {
    if (request.method === "GET" && !request.path.startsWith("/api/") && request.accepts("html")) {
      response.sendFile(resolve(staticDirectory, "index.html"));
      return;
    }
    next();
  });
  return app;
}
