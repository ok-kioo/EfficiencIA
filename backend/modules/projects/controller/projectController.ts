import type { NextFunction, Request, Response } from "express";
import { createProjectSchema, updateProjectSchema } from "../domain/Project.js";
import * as service from "../service/projectService.js";

export async function listHandler(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await service.listByUser(req.user!.id));
  } catch (err) {
    next(err);
  }
}

export async function getHandler(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await service.findOwned(req.user!.id, req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function createHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createProjectSchema.parse(req.body);
    res.status(201).json(await service.create(req.user!.id, data));
  } catch (err) {
    next(err);
  }
}

export async function updateHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateProjectSchema.parse(req.body);
    res.json(await service.update(req.user!.id, req.params.id, data));
  } catch (err) {
    next(err);
  }
}

export async function deleteHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await service.remove(req.user!.id, req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
