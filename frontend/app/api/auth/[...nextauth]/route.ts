import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Hardcoded demo credentials - Replace this with your actual database lookup
        const demoUser = { id: "1", name: "Saksham", email: "saksham@gmail.com", password: "1234" };

        if (
          credentials?.email === demoUser.email &&
          credentials?.password === demoUser.password
        ) {
          return { id: demoUser.id, name: demoUser.name, email: demoUser.email };
        }
        
        return null;
      }
    })
  ],
  pages: {
    signIn: "/login", // Redirects to our custom login page
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
