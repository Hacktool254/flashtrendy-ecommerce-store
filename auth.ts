import NextAuth from "next-auth";
import { prisma } from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    signOut: "/logout",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnCheckout = nextUrl.pathname.startsWith("/checkout");

      if (isOnAdmin) {
        if (isLoggedIn && auth?.user?.role === "ADMIN") return true;
        return false; // Redirect unauthenticated users to login page
      }

      if (isOnDashboard || isOnCheckout) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }

      if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/register")) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
    async signIn({ user, account, profile }) {
      // Handle OAuth sign-in: create or update user and account in database
      if (account && (account.provider === "google" || account.provider === "github")) {
        try {
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

          // Check if user with this email already exists
          let dbUser = user.email
            ? await prisma.user.findUnique({
                where: { email: user.email },
              })
            : null;

          if (!dbUser) {
            // Create new user
            dbUser = await prisma.user.create({
              data: {
                email: user.email!,
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

          // Create account record
          await prisma.account.create({
            data: {
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
      // Initial sign in
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }

      // For OAuth, fetch user from database to get role
      if (account && (account.provider === "google" || account.provider === "github")) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
          });

          if (dbUser) {
            token.role = dbUser.role;
            token.id = dbUser.id;
          }
        } catch (error) {
          console.error("Error fetching user in JWT callback:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;

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
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
});