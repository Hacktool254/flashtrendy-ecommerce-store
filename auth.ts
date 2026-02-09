import NextAuth from "next-auth";
import authConfig from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Lazy-load Prisma to avoid importing it in Edge Runtime
async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Full Auth.js instance with database support (for API routes, pages, etc.)
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, account }) {
      // Call the base JWT callback first
      const baseToken = await authConfig.callbacks?.jwt?.({ token, user, account } as any);
      if (baseToken) token = baseToken as any;

      return token;
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const prisma = await getPrisma();

          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            };
          }
        }

        return null;
      },
    }),
  ],
});
