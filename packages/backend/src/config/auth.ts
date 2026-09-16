import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_in_production";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export interface JwtPayloadCustom extends JwtPayload {
  userId: string;
  role: string;
}

export function generateToken(payload: { userId: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions);
}

export function verifyToken(token: string): JwtPayloadCustom {
  return jwt.verify(token, JWT_SECRET) as JwtPayloadCustom;
}

export function generateResetToken(payload: { userId: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

export function verifyResetToken(token: string): JwtPayloadCustom {
  return jwt.verify(token, JWT_SECRET) as JwtPayloadCustom;
}
