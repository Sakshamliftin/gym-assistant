import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Demo user — replace with Prisma DB lookup in Milestone 2
const DEMO_USER = {
  id: "1",
  name: "Saksham",
  email: "saksham@gmail.com",
  password: "1234",
};

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

        // Demo auth — swap this block with DB lookup later
        if (
          credentials.email === DEMO_USER.email &&
          credentials.password === DEMO_USER.password
        ) {
          return {
            id: DEMO_USER.id,
            name: DEMO_USER.name,
            email: DEMO_USER.email,
          };
        }

        return null;
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
      // Persist user id into the JWT on first sign-in
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Forward the id from JWT to the session object
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
