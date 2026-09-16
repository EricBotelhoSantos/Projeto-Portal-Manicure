import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@anapaula.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin123";
  const hashed = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.ADMIN },
    create: {
      name: "Ana Paula",
      email: adminEmail,
      phone: "(11) 99999-9999",
      password: hashed,
      role: Role.ADMIN,
    },
  });

  const services = [
    { name: "Manicure Simples", description: "Cutilagem, lixamento, hidratação e esmaltação tradicional.", price: "45.00", durationMinutes: 60 },
    { name: "Manicure + Pedicure", description: "Cuidado completo para mãos e pés com esmaltação.", price: "85.00", durationMinutes: 120 },
    { name: "Esmaltação em Gel", description: "Esmaltação em gel com maior durabilidade e brilho.", price: "90.00", durationMinutes: 90 },
    { name: "Alongamento em Fibra", description: "Alongamento em fibra de vidro com formato à sua escolha.", price: "150.00", durationMinutes: 150 },
    { name: "Francesinha + Decoração", description: "Francesinha clássica com decoração em duas unhas.", price: "70.00", durationMinutes: 75 },
    { name: "Spa das Mãos", description: "Hidratação profunda, esfoliação e massagem relaxante.", price: "60.00", durationMinutes: 45 },
  ];

  for (const s of services) {
    const existing = await prisma.service.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.service.create({
        data: { ...s, price: s.price, active: true },
      });
    }
  }

  // Seg-Sex 08:00-18:00 com intervalo 12:00-13:00, Sáb 08:00-12:00, Dom fechado
  const defaults = [
    { dayOfWeek: 1, startTime: "08:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:00", active: true },
    { dayOfWeek: 2, startTime: "08:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:00", active: true },
    { dayOfWeek: 3, startTime: "08:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:00", active: true },
    { dayOfWeek: 4, startTime: "08:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:00", active: true },
    { dayOfWeek: 5, startTime: "08:00", endTime: "18:00", breakStart: "12:00", breakEnd: "13:00", active: true },
    { dayOfWeek: 6, startTime: "08:00", endTime: "12:00", breakStart: null, breakEnd: null, active: true },
    { dayOfWeek: 0, startTime: "08:00", endTime: "12:00", breakStart: null, breakEnd: null, active: false },
  ];

  for (const d of defaults) {
    const existing = await prisma.availability.findFirst({ where: { dayOfWeek: d.dayOfWeek } });
    if (existing) {
      await prisma.availability.update({ where: { id: existing.id }, data: d });
    } else {
      await prisma.availability.create({ data: d });
    }
  }

  console.log("Seed concluído.");
  console.log(`Admin: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
