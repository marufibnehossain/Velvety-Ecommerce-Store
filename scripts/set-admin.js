const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const email = "marufibnhossain@gmail.com";
  // Use raw SQL so we don't depend on Prisma client having the role field generated
  const result = await prisma.$executeRawUnsafe(
    "UPDATE User SET role = ? WHERE email = ?",
    "ADMIN",
    email.toLowerCase().trim()
  );
  if (result === 0) {
    console.log(`No user found with email ${email}. Create the account first via /account/register.`);
    process.exit(1);
  }
  console.log(`Set role to ADMIN for ${email}.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
