import { User, Role } from "@prisma/client";
import prisma from "../config/prisma";
import { hashPassword, comparePassword } from "./auth.service";
import { generateToken, generateResetToken, verifyResetToken } from "../config/auth";

interface RegisterInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface ForgotPasswordInput {
  email: string;
}

interface ResetPasswordInput {
  token: string;
  password: string;
}

interface UpdateProfileInput {
  name?: string;
  phone?: string;
  email?: string;
}

export async function registerUser(input: RegisterInput): Promise<{ user: Omit<User, "password">; token: string }> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new Error("E-mail já cadastrado");
  }

  const hashedPassword = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: hashedPassword,
      role: Role.CLIENT,
    },
  });

  const token = generateToken({ userId: user.id, role: user.role });

  return {
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, createdAt: user.createdAt, updatedAt: user.updatedAt },
    token,
  };
}

export async function loginUser(input: LoginInput): Promise<{ user: Omit<User, "password">; token: string }> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new Error("Credenciais inválidas");
  }

  const valid = await comparePassword(input.password, user.password);
  if (!valid) {
    throw new Error("Credenciais inválidas");
  }

  const token = generateToken({ userId: user.id, role: user.role });

  return {
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, createdAt: user.createdAt, updatedAt: user.updatedAt },
    token,
  };
}

export async function forgotPassword(input: ForgotPasswordInput): Promise<{ message: string; resetToken?: string }> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    return { message: "Se o e-mail estiver cadastrado, enviaremos instruções para redefinir sua senha." };
  }

  const resetToken = generateResetToken({ userId: user.id });

  return {
    message: "Se o e-mail estiver cadastrado, enviaremos instruções para redefinir sua senha.",
    resetToken,
  };
}

export async function resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
  const { token, password } = input;

  try {
    const payload = verifyResetToken(token);
    const userId = payload.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error("Token inválido");
    }

    const hashedPassword = await hashPassword(password);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: "Senha redefinida com sucesso" };
  } catch (error) {
    throw new Error("Token inválido ou expirado");
  }
}

export async function getUserById(userId: string): Promise<Omit<User, "password"> | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true, updatedAt: true },
  });
  return user;
}

export async function updateProfile(userId: string, input: UpdateProfileInput): Promise<Omit<User, "password">> {
  const data: Record<string, unknown> = {};
  if (input.name) data.name = input.name;
  if (input.email) {
    const existing = await prisma.user.findFirst({
      where: { email: input.email, id: { not: userId } },
    });
    if (existing) throw new Error("E-mail já cadastrado");
    data.email = input.email;
  }
  if (input.phone) data.phone = input.phone;

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true, updatedAt: true },
  });
  return user;
}
