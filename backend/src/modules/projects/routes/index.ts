import { Router } from "express";
import { requireAuth } from "../../../infra/authMiddleware.js";
import { requirePremium } from "../../../infra/planMiddleware.js";
import * as ctrl from "../controller/projectController.js";
import {
  listForProjectHandler,
  createForProjectHandler,
} from "../../analyses/controller/analysisController.js";

const router = Router();
router.use(requireAuth);

router.get("/", ctrl.listHandler);
router.post("/", ctrl.createHandler);
router.get("/:id", ctrl.getHandler);
router.put("/:id", ctrl.updateHandler);
router.delete("/:id", ctrl.deleteHandler);

// Análises por projeto — criação exige plano Premium.
router.get("/:id/analyses", listForProjectHandler);
router.post("/:id/analyses", requirePremium, createForProjectHandler);

export { router as projectsRoutes };
