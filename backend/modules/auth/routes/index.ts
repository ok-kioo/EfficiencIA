import { Router } from "express";
import { requireAuth } from "../../../infra/authMiddleware.js";
import {
  googleHandler,
  loginHandler,
  meHandler,
  signupHandler,
} from "../controller/authController.js";

const router = Router();

router.post("/google", googleHandler);
router.post("/signup", signupHandler);
router.post("/login", loginHandler);
router.get("/me", requireAuth, meHandler);

export { router as authRoutes };
