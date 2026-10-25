import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";

import type { AppDependencies } from "../app";
import { verifyPassword } from "../auth/password";
import {
  createSession,
  deleteSession,
  readSessionToken,
  SESSION_COOKIE_NAME
} from "../auth/sessions";
import { requireAuth } from "../middleware/requireAuth";

const loginSchema = z.object({ password: z.string().min(1) });

export function createAuthRouter(dependencies: AppDependencies): Router {
  const router = Router();
  const limit = dependencies.loginRateLimit ?? { limit: 5, windowMs: 15 * 60_000 };
  const loginLimiter = rateLimit({
    limit: limit.limit,
    windowMs: limit.windowMs,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_request, response) => {
      response.status(429).json({
        error: { code: "RATE_LIMITED", message: "尝试次数过多，请稍后再试" }
      });
    }
  });

  router.post("/auth/login", loginLimiter, async (request, response) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: { code: "INVALID_REQUEST", message: "请输入密码" } });
      return;
    }

    if (!(await verifyPassword(dependencies.config.authPasswordHash, parsed.data.password))) {
      response.status(401).json({ error: { code: "INVALID_CREDENTIALS", message: "密码不正确" } });
      return;
    }

    const now = (dependencies.now ?? (() => new Date()))();
    const token = createSession(
      dependencies.db,
      dependencies.config.sessionSecret,
      now,
      dependencies.config.sessionTtlDays
    );
    response.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: dependencies.config.cookieSecure,
      sameSite: "lax",
      maxAge: dependencies.config.sessionTtlDays * 24 * 60 * 60 * 1000,
      path: "/"
    });
    response.json({ authenticated: true });
  });

  router.get("/session", requireAuth(dependencies), (_request, response) => {
    response.json({ authenticated: true });
  });

  router.post("/auth/logout", (request, response) => {
    const token = readSessionToken(request.headers.cookie);
    if (token) {
      deleteSession(dependencies.db, token, dependencies.config.sessionSecret);
    }
    response.clearCookie(SESSION_COOKIE_NAME, {
      httpOnly: true,
      secure: dependencies.config.cookieSecure,
      sameSite: "lax",
      path: "/"
    });
    response.status(204).end();
  });

  return router;
}
