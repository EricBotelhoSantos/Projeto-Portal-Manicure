import { Request, Response } from "express";
import { body } from "express-validator";
import { AuthenticatedRequest } from "../types/express";
import { registerUser, loginUser, forgotPassword, resetPassword, getUserById, updateProfile } from "../services/user.service";
import { validateRequest } from "../middleware/validation.middleware";

export const registerValidation = [
  body("name").trim().notEmpty().withMessage("Nome é obrigatório"),
  body("email").isEmail().withMessage("E-mail inválido"),
  body("phone").optional().isString(),
  body("password").isLength({ min: 6 }).withMessage("Senha deve ter pelo menos 6 caracteres"),
  validateRequest,
];

export const loginValidation = [
  body("email").isEmail().withMessage("E-mail inválido"),
  body("password").notEmpty().withMessage("Senha é obrigatória"),
  validateRequest,
];

export const forgotPasswordValidation = [
  body("email").isEmail().withMessage("E-mail inválido"),
  validateRequest,
];

export const resetPasswordValidation = [
  body("token").notEmpty().withMessage("Token é obrigatório"),
  body("password").isLength({ min: 6 }).withMessage("Senha deve ter pelo menos 6 caracteres"),
  validateRequest,
];

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Erro interno" });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    res.json(await loginUser(req.body));
  } catch (error) {
    res.status(401).json({ message: error instanceof Error ? error.message : "Erro interno" });
  }
}

export async function forgotPasswordController(req: Request, res: Response): Promise<void> {
  try {
    res.json(await forgotPassword(req.body));
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Erro interno" });
  }
}

export async function resetPasswordController(req: Request, res: Response): Promise<void> {
  try {
    res.json(await resetPassword(req.body));
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Erro interno" });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: "Não autenticado" });
    return;
  }
  try {
    res.json({ user: await getUserById(req.user.id) });
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Erro interno" });
  }
}

export async function updateProfileController(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: "Não autenticado" });
    return;
  }
  try {
    res.json({ user: await updateProfile(req.user.id, req.body) });
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Erro interno" });
  }
}
