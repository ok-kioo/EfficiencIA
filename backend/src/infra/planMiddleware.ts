import type { NextFunction, Request, Response } from "express";
import { findById } from "../modules/users/service/userService.js";

/**
 * Garante que o usuário autenticado é do plano PREMIUM.
 * Deve ser usado APÓS `requireAuth`.
 */
export async function requirePremium(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "unauthorized", message: "Não autenticado." });
    }
    const user = await findById(req.user.id);
    if (user.plan !== "premium") {
      return res.status(403).json({
        error: "plan_required",
        message:
          "Este recurso faz parte do plano Premium. Faça o upgrade para liberar a análise inteligente.",
        requiredPlan: "premium",
      });
    }
    return next();
  } catch (err) {
    return next(err);
  }
}
