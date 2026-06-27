import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(public status: number, message: string, public code = "error") {
    super(message);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.code, message: err.message });
  }
  if (err instanceof ZodError) {
    return res
      .status(400)
      .json({ error: "validation_error", message: "Dados inválidos.", details: err.flatten() });
  }
  console.error("[unhandled]", err);
  const message = err instanceof Error ? err.message : "Erro interno.";
  return res.status(500).json({ error: "internal_error", message });
}
