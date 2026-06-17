import { Router } from "express";
import { requireAuth } from "../../../infra/authMiddleware.js";
import { getHandler, listRecentHandler } from "../controller/analysisController.js";

const router = Router();
router.use(requireAuth);

router.get("/recent", listRecentHandler);
router.get("/:id", getHandler);

export { router as analysesRoutes };
