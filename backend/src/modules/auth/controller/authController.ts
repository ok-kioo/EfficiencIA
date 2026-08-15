import type { Request, Response, NextFunction } from "express";
import {
  emailLoginSchema,
  emailSignupSchema,
  forgotPasswordSchema,
  /* googleLoginSchema ,*/
  resetPasswordSchema,
} from "../domain/entity/Auth.js";
import {
  getCurrentUser,
  loginWithEmail,
  /* loginWithGoogle ,*/
  requestPasswordReset,
  resetPassword,
  signupWithEmail,
} from "../service/authService.js";

/* export async function googleHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { idToken } = googleLoginSchema.parse(req.body);
    res.json(await loginWithGoogle(idToken));
  } catch (err) {
    next(err);
  }
} */

export async function signupHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name } = emailSignupSchema.parse(req.body);
    res.status(201).json(await signupWithEmail(email, password, name));
  } catch (err) {
    next(err);
  }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = emailLoginSchema.parse(req.body);
    res.json(await loginWithEmail(email, password));
  } catch (err) {
    next(err);
  }
}

export async function meHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getCurrentUser(req.user!.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function forgotPasswordHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    res.json(await requestPasswordReset(email));
  } catch (err) {
    next(err);
  }
}

export async function resetPasswordHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);
    await resetPassword(token, password);
    res.json({ message: "Senha redefinida com sucesso." });
  } catch (err) {
    next(err);
  }
}
