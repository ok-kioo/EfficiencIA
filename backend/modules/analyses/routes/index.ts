import { Router } from "express";
import { requireAuth } from "../../../infra/authMiddleware.js";
import { getHandler } from "../controller/analysisController.js";

const router = Router();
router.use(requireAuth);

router.get("/:id", getHandler);

export { router as analysesRoutes };
