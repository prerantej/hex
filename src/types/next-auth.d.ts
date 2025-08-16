import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    role: "STUDENT" | "ADMIN";
    handle: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role: "STUDENT" | "ADMIN";
      handle: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "STUDENT" | "ADMIN";
    handle: string;
  }
}

export {};
