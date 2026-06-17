import type { NextFunction, Request, Response } from "express";
import * as service from "../service/analysisService.js";

export async function listForProjectHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    res.json(await service.listForProject(req.user!.id, req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function createForProjectHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const analysis = await service.createForProject(req.user!.id, req.params.id);
    res.status(201).json(analysis);
  } catch (err) {
    next(err);
  }
}

export async function getHandler(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await service.findOne(req.user!.id, req.params.id));
  } catch (err) {
    next(err);
  }
}
