import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Since we are using a DB now, ensure the user exists
        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // If user doesn't exist, auto-create them for this demo
        if (!user) {
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split("@")[0],
              password: credentials.password, // In a real app, hash this!
            },
          });
        } else {
          // In a real app, compare hashed passwords here
          if (user.password !== credentials.password) {
            return null;
          }
        }

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
