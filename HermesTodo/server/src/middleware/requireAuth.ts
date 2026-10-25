import type { NextFunction, Request, Response } from "express";

import type { AppDependencies } from "../app";
import { findSession, readSessionToken } from "../auth/sessions";

export function requireAuth(dependencies: AppDependencies) {
  return (request: Request, response: Response, next: NextFunction): void => {
    const token = readSessionToken(request.headers.cookie);
    const sessionId = token
      ? findSession(
          dependencies.db,
          token,
          dependencies.config.sessionSecret,
          (dependencies.now ?? (() => new Date()))(),
          dependencies.config.sessionTtlDays
        )
      : null;

    if (!sessionId) {
      response.status(401).json({ error: { code: "UNAUTHENTICATED", message: "请先登录" } });
      return;
    }

    response.locals.sessionId = sessionId;
    next();
  };
}
