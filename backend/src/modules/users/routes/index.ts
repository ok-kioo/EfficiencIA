import { Router } from "express";
import { requireAuth } from "../../../infra/authMiddleware.js";
import {
  meHandler,
  upgradeHandler,
  downgradeHandler,
} from "../controller/userController.js";

const router = Router();
router.get("/me", requireAuth, meHandler);
router.post("/me/upgrade", requireAuth, upgradeHandler);
router.post("/me/downgrade", requireAuth, downgradeHandler);

export { router as usersRoutes };
