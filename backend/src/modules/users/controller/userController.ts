import type { NextFunction, Request, Response } from "express";
import { completeOnboarding, findById, setPlan } from "../service/userService.js";

export async function meHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await findById(req.user!.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function upgradeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await setPlan(req.user!.id, "premium");
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function downgradeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await setPlan(req.user!.id, "free");
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function onboardingCompleteHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await completeOnboarding(req.user!.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}
