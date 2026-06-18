import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

function buildUsername(seed: string) {
  const normalized = seed
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);

  return normalized || "google-user";
}

async function ensureUniqueUsername(baseUsername: string) {
  let candidate = baseUsername;
  let suffix = 1;

  while (await prisma.user.findUnique({ where: { username: candidate } })) {
    candidate = `${baseUsername}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

async function upsertGoogleUser({
  email,
  name,
  image,
}: {
  email: string;
  name?: string | null;
  image?: string | null;
}) {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return existingUser;
  }

  const baseUsername = buildUsername(email.split("@")[0] || name || "google-user");
  const username = await ensureUniqueUsername(baseUsername);

  return prisma.user.create({
    data: {
      name: name || username,
      username,
      email,
      password: null,
    },
  });
}

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

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
          // User doesn't exist, must signup first
          return null;
        }

        if (!user.password) {
          return null;
        }

        const isMatch = await bcrypt.compare(credentials.password, user.password);
        // Fallback to plain text check to ensure existing demo users still work
        if (!isMatch && user.password !== credentials.password) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
        };
      },
    }),
    ...(googleClientId && googleClientSecret
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : []),
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
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;

        if (user.username) {
          token.id = user.id;
          token.username = user.username;
        } else if (user.email) {
          const googleUser = await upsertGoogleUser({
            email: user.email,
            name: user.name,
            image: user.image,
          });

          token.id = googleUser.id;
          token.username = googleUser.username;
          token.name = googleUser.name;
          token.email = googleUser.email;
          token.picture = user.image ?? token.picture;
        }
      }

      if (!token.id && token.email) {
        const googleUser = await upsertGoogleUser({
          email: token.email,
          name: token.name,
          image: token.picture,
        });

        token.id = googleUser.id;
        token.username = googleUser.username;
        token.name = googleUser.name;
        token.email = googleUser.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.name = token.name ?? session.user.name;
        session.user.email = token.email ?? session.user.email;
        session.user.image = token.picture ?? session.user.image;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
