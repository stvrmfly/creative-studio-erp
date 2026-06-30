import { PrismaClient } from "@prisma/client";
import { seed } from "../lib/seed";

const prisma = new PrismaClient();

seed(prisma)
  .then(() => console.log("Seed complete."))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
