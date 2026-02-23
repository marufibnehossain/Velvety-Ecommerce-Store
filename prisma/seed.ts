import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      type: "PERCENT",
      value: 10,
      minOrderCents: null,
      expiresAt: null,
    },
  });
  await prisma.coupon.upsert({
    where: { code: "SAVE5" },
    update: {},
    create: {
      code: "SAVE5",
      type: "FIXED",
      value: 500, // $5.00
      minOrderCents: 3000, // $30
      expiresAt: null,
    },
  });
  console.log("Seeded coupons: WELCOME10 (10% off), SAVE5 ($5 off orders $30+)");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
