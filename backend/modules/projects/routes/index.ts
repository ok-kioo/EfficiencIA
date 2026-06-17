import { Router } from "express";
import { requireAuth } from "../../../infra/authMiddleware.js";
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

// Nested analyses por projeto
router.get("/:id/analyses", listForProjectHandler);
router.post("/:id/analyses", createForProjectHandler);

export { router as projectsRoutes };
