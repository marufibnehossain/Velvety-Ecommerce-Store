import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.toLowerCase().trim();
        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user) return null;
        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }
        const valid = await verifyPassword(credentials.password, user.passwordHash);
        if (!valid) return null;
        // Read role via raw query so it works even if Prisma client was generated before role existed
        const rows = await prisma.$queryRawUnsafe<Array<{ role: string | null }>>(
          "SELECT role FROM User WHERE id = ?",
          user.id
        );
        const role = rows[0]?.role ?? undefined;
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: role ?? undefined,
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/account/login",
    error: "/account/login",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string | null;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
