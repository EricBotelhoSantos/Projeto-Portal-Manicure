import { Request, Response } from "express";
import { body } from "express-validator";
import { Prisma } from "@prisma/client";
import prisma from "../config/prisma";
import { validateRequest } from "../middleware/validation.middleware";

export const serviceValidation = [
  body("name").trim().notEmpty().withMessage("Nome é obrigatório"),
  body("durationMinutes").isInt({ min: 5, max: 480 }).withMessage("Duração deve ser entre 5 e 480 minutos"),
  body("price").isFloat({ min: 0 }).withMessage("Preço inválido"),
  body("description").optional().isString(),
  body("image").optional().isString(),
  body("active").optional().isBoolean(),
  validateRequest,
];

export const updateServiceValidation = [
  body("name").optional().trim().notEmpty().withMessage("Nome é obrigatório"),
  body("durationMinutes").optional().isInt({ min: 5, max: 480 }).withMessage("Duração deve ser entre 5 e 480 minutos"),
  body("price").optional().isFloat({ min: 0 }).withMessage("Preço inválido"),
  body("description").optional().isString(),
  body("image").optional().isString(),
  body("active").optional().isBoolean(),
  validateRequest,
];
function toDecimal(value: unknown): Prisma.Decimal | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  return new Prisma.Decimal(String(value));
}

export async function getServicesAll(_req: Request, res: Response): Promise<void> {
  try {
    res.json(await prisma.service.findMany({ orderBy: { name: "asc" } }));
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Erro interno" });
  }
}

export async function createService(req: Request, res: Response): Promise<void> {
  try {
    const price = toDecimal(req.body.price);
    if (!price) {
      res.status(400).json({ message: "Preço é obrigatório" });
      return;
    }
    const service = await prisma.service.create({
      data: {
        name: req.body.name,
        description: req.body.description ?? null,
        price,
        durationMinutes: parseInt(String(req.body.durationMinutes), 10),
        image: req.body.image ?? null,
        active: req.body.active ?? true,
      },
    });
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Erro interno" });
  }
}

export async function updateService(req: Request, res: Response): Promise<void> {
  try {
    const data: Record<string, unknown> = {};
    if (req.body.name !== undefined) data.name = req.body.name;
    if (req.body.description !== undefined) data.description = req.body.description;
    if (req.body.price !== undefined) {
      const price = toDecimal(req.body.price);
      if (!price) {
        res.status(400).json({ message: "Preço inválido" });
        return;
      }
      data.price = price;
    }
    if (req.body.durationMinutes !== undefined) data.durationMinutes = parseInt(String(req.body.durationMinutes), 10);
    if (req.body.image !== undefined) data.image = req.body.image;
    if (req.body.active !== undefined) data.active = req.body.active;
    res.json(await prisma.service.update({ where: { id: req.params.id }, data: data as never }));
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") {
      res.status(404).json({ message: "Serviço não encontrado" });
    } else {
      res.status(500).json({ message: error instanceof Error ? error.message : "Erro interno" });
    }
  }
}

export async function deleteService(req: Request, res: Response): Promise<void> {
  try {
    const count = await prisma.appointment.count({
      where: { serviceId: req.params.id, status: { in: ["PENDING", "CONFIRMED"] } },
    });
    if (count > 0) {
      res.status(409).json({ message: "Serviço possui agendamentos ativos e não pode ser excluído. Desative-o." });
      return;
    }
    await prisma.service.delete({ where: { id: req.params.id } });
    res.json({ message: "Serviço removido com sucesso" });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") {
      res.status(404).json({ message: "Serviço não encontrado" });
    } else {
      res.status(500).json({ message: error instanceof Error ? error.message : "Erro interno" });
    }
  }
}

export async function toggleServiceStatus(req: Request, res: Response): Promise<void> {
  try {
    const service = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!service) {
      res.status(404).json({ message: "Serviço não encontrado" });
      return;
    }
    res.json(await prisma.service.update({ where: { id: req.params.id }, data: { active: !service.active } }));
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : "Erro interno" });
  }
}
