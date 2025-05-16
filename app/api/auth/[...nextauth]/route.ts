import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth/next";
import { authOptions } from '@/lib/auth';

declare module "next-auth" {
  interface User {
    role?: string;
  }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 