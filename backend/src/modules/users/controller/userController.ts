import type { NextFunction, Request, Response } from "express";
import { findById } from "../service/userService.js";

export async function meHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await findById(req.user!.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}
