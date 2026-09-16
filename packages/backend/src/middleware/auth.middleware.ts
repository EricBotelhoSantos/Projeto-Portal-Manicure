import { Response, NextFunction } from "express";
import { verifyToken } from "../config/auth";
import { AuthenticatedRequest } from "../types/express";

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Token de acesso necessário" });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.userId, role: payload.role };
    next();
  } catch (error) {
    res.status(403).json({ message: "Token inválido ou expirado" });
  }
}

export function requireRole(roles: string[]): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: "Usuário não autenticado" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: "Permissão negada. Acesso restrito." });
      return;
    }

    next();
  };
}
