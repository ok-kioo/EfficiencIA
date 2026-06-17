import { Router } from "express";
import { requireAuth } from "../../../infra/authMiddleware.js";
import { meHandler } from "../controller/userController.js";

const router = Router();
router.get("/me", requireAuth, meHandler);

export { router as usersRoutes };
