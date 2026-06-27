import { Router } from "express";
import { requireAuth } from "../../../infra/authMiddleware.js";
import {
  meHandler,
  upgradeHandler,
  downgradeHandler,
  onboardingCompleteHandler,
} from "../controller/userController.js";

const router = Router();
router.get("/me", requireAuth, meHandler);
router.post("/me/upgrade", requireAuth, upgradeHandler);
router.post("/me/downgrade", requireAuth, downgradeHandler);
router.post("/me/onboarding/complete", requireAuth, onboardingCompleteHandler);

export { router as usersRoutes };
