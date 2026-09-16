import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ["error", "warn"],
  });
};

const prisma = global.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
