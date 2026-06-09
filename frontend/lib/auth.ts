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

        // Find user by email or username
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.email.toLowerCase() },
              { username: credentials.email.toLowerCase() }
            ]
          },
        });

        if (!user) {
          const email = credentials.email.includes("@") ? credentials.email.toLowerCase() : `${credentials.email.toLowerCase()}@gymbuddy.com`;
          const username = credentials.email.includes("@") ? credentials.email.split("@")[0].toLowerCase() : credentials.email.toLowerCase();

          // Ensure username uniqueness
          const existingUsername = await prisma.user.findUnique({
            where: { username }
          });
          const finalUsername = existingUsername ? `${username}_${Math.floor(Math.random() * 1000)}` : username;

          user = await prisma.user.create({
            data: {
              email,
              username: finalUsername,
              name: finalUsername,
              password: credentials.password,
              profile: {
                create: {
                  onboardingDone: false
                }
              }
            }
          });
        } else {
          if (user.password !== credentials.password) {
            return null;
          }
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
        };
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
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
