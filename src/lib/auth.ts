import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "../lib/db";

// Full NextAuth config
export const config = {
  session: { strategy: "jwt" },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (creds) => {
        if (!creds?.email || !creds?.password) return null;

        const email = String(creds.email).toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const ok = await bcrypt.compare(String(creds.password), user.passwordHash);
        if (!ok) return null;

        // Return the minimal user object that becomes `user` in the JWT callback
        return {
          id: user.id,
          email: user.email,
          // We’ll keep handle separate from "name" and also copy to token explicitly.
          name: user.handle,
          role: user.role ?? "STUDENT",
          handle: user.handle,
        } as any;
      },
    }),
  ],

  callbacks: {
    // Put extra fields on the token at sign-in
    async jwt({ token, user }) {
      if (user) {
        (token as any).role = (user as any).role;
        (token as any).handle = (user as any).handle ?? (user as any).name;
      }
      return token;
    },

    // Expose those fields on the session object
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub!;
        (session.user as any).role = (token as any).role ?? "STUDENT";
        (session.user as any).handle = (token as any).handle ?? session.user.name;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

// Exports used by App Router (auth(), route handlers, signIn/signOut helpers)
export const {
  auth,
  handlers: { GET, POST },
  signIn,
  signOut,
} = NextAuth(config);
