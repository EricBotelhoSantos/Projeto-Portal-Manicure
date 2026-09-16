import "dotenv/config";
import app from "./app";
import prisma from "./config/prisma";

const PORT = process.env.PORT || 3333;

process.on("SIGTERM", () => {
  void prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", () => {
  void prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`[Ana Nail Backend] Running on http://localhost:${PORT}`);
  prisma
    .$queryRaw`SELECT 1`
    .then(() => console.log("[Ana Nail Backend] Database connected successfully"))
    .catch((err: unknown) => console.error("[Ana Nail Backend] Database connection failed", err));
});
