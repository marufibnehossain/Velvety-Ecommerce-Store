const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const products = await prisma.$queryRawUnsafe("SELECT id, slug, name FROM Product LIMIT 10");
    console.log("Products in DB:", products.length);
    console.log(products);
    const categories = await prisma.$queryRawUnsafe("SELECT id, name, slug FROM Category");
    console.log("\nCategories in DB:", categories.length);
    console.log(categories);
  } catch (e) {
    console.error("Error:", e.message);
    console.log("\nPrisma client might need regeneration. Products may exist but client doesn't know about Product model.");
  }
  prisma.$disconnect();
}

main();
