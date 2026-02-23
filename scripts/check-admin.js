const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const email = "marufibnhossain@gmail.com";
  const rows = await prisma.$queryRawUnsafe(
    "SELECT id, email, role FROM User WHERE email = ?",
    email.toLowerCase().trim()
  );
  console.log("User(s) with email", email, ":", JSON.stringify(rows, null, 2));
  if (rows.length === 0) {
    console.log("No user found. Register first at /account/register with this email.");
  } else if (rows[0].role !== "ADMIN") {
    console.log("Role is not ADMIN. Running set-admin.js to fix...");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
