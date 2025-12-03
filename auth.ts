import NextAuth from "next-auth";
import authConfig from "./auth.config";
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
    // Add database-specific callbacks here
    async signIn({ user, account, profile }) {
      // Handle OAuth sign-in: create or update user and account in database
      if (account && (account.provider === "google" || account.provider === "github")) {
        try {
          const prisma = await getPrisma();
          // Check if account already exists
          const existingAccount = await prisma.account.findUnique({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: String(account.providerAccountId),
              },
            },
            include: { user: true },
          });

          if (existingAccount) {
            // Account exists, update user info if needed
            if (user.email && (user.name !== existingAccount.user.name || user.image !== existingAccount.user.image)) {
              await prisma.user.update({
                where: { id: existingAccount.userId },
                data: {
                  name: user.name || existingAccount.user.name,
                  image: user.image || existingAccount.user.image,
                  emailVerified: new Date(),
                },
              });
            }
            return true;
          }

          // OAuth providers must provide an email
          if (!user.email) {
            console.error(`OAuth provider ${account.provider} did not provide an email address`);
            return false;
          }

          // Check if user with this email already exists
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!dbUser) {
            // Create new user
            dbUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || null,
                image: user.image || null,
                password: "", // OAuth users don't have passwords
                emailVerified: new Date(),
                role: "USER",
              },
            });
          } else {
            // Update existing user with OAuth info
            dbUser = await prisma.user.update({
              where: { id: dbUser.id },
              data: {
                name: user.name || dbUser.name,
                image: user.image || dbUser.image,
                emailVerified: new Date(),
              },
            });
          }

          // Use upsert to handle race conditions
          await prisma.account.upsert({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: String(account.providerAccountId),
              },
            },
            update: {
              refresh_token: account.refresh_token || null,
              access_token: account.access_token || null,
              expires_at: account.expires_at || null,
              token_type: account.token_type || null,
              scope: account.scope || null,
              id_token: account.id_token || null,
              session_state: account.session_state ? String(account.session_state) : null,
            },
            create: {
              userId: dbUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: String(account.providerAccountId),
              refresh_token: account.refresh_token || null,
              access_token: account.access_token || null,
              expires_at: account.expires_at || null,
              token_type: account.token_type || null,
              scope: account.scope || null,
              id_token: account.id_token || null,
              session_state: account.session_state ? String(account.session_state) : null,
            },
          });

          return true;
        } catch (error) {
          console.error("Error handling OAuth sign-in:", error);
          return false;
        }
      }

      // For credentials provider, allow sign-in
      return true;
    },
    async jwt({ token, user, account }) {
      // Call the base JWT callback first
      const baseToken = await authConfig.callbacks?.jwt?.({ token, user, account } as any);
      if (baseToken) token = baseToken as any;

      // Add database-specific logic for OAuth
      if (account && (account.provider === "google" || account.provider === "github")) {
        try {
          const prisma = await getPrisma();
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
          });

          if (dbUser) {
            token.role = dbUser.role;
            token.id = dbUser.id;
          } else {
            console.error(`User with email ${token.email} not found in database during JWT callback`);
            // Don't modify token on error - keep existing values
          }
        } catch (error) {
          console.error("Error fetching user in JWT callback:", error);
          // Don't modify token on error - keep existing values
        }
      }

      return token;
    },
  },
  providers: [
    // Override Credentials provider with database support
    {
      id: "credentials",
      name: "Credentials",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
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
    },
    ...(authConfig.providers?.filter((p: any) => p.id !== "credentials") || []),
  ],
});
