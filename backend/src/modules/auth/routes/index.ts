import { Router } from "express";
import { requireAuth } from "../../../infra/authMiddleware.js";
import {
  forgotPasswordHandler,
  /* googleHandler, */
  loginHandler,
  meHandler,
  resetPasswordHandler,
  signupHandler,
} from "../controller/authController.js";

const router = Router();

/* router.post("/google", googleHandler); */
router.post("/signup", signupHandler);
router.post("/login", loginHandler);
router.post("/forgot-password", forgotPasswordHandler);
router.post("/reset-password", resetPasswordHandler);
router.get("/me", requireAuth, meHandler);

export { router as authRoutes };
