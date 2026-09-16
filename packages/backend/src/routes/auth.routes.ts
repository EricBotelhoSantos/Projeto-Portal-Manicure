import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import {
  register,
  login,
  forgotPasswordController,
  resetPasswordController,
  getMe,
  updateProfileController,
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/forgot-password", forgotPasswordValidation, forgotPasswordController);
router.post("/reset-password", resetPasswordValidation, resetPasswordController);
router.get("/me", authenticateToken, getMe);
router.put("/profile", authenticateToken, updateProfileController);

export default router;
