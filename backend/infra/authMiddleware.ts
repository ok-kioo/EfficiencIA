import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "./jwt.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: { id: string; email: string };
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "unauthorized", message: "Token ausente." });
  }
  try {
    const payload = verifyToken(header.slice("Bearer ".length));
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch {
    return res.status(401).json({ error: "unauthorized", message: "Token inválido." });
  }
}
