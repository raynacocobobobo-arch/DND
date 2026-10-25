import type { NextFunction, Request, Response } from "express";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function originGuard(publicOrigin: string) {
  const allowedOrigin = new URL(publicOrigin).origin;

  return (request: Request, response: Response, next: NextFunction): void => {
    const origin = request.headers.origin;
    if (SAFE_METHODS.has(request.method) || !origin || origin === allowedOrigin) {
      next();
      return;
    }

    response.status(403).json({
      error: { code: "ORIGIN_NOT_ALLOWED", message: "请求来源不受信任" }
    });
  };
}
