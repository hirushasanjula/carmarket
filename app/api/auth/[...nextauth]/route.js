import connectToDatabase from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import User from "@/models/user";

console.log("Initializing NextAuth with env:", {
  MONGO: !!process.env.MONGO,
  AUTH_SECRET: !!process.env.AUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
});

if (!process.env.AUTH_SECRET) {
  console.error("AUTH_SECRET is not defined");
}

if (!process.env.MONGO) {
  console.error("MONGO is not defined");
}

export const authOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          console.log("Authorize: Starting for", credentials?.email);
          console.log("Authorize: Connecting to MongoDB...");
          await connectToDatabase();
          console.log("Authorize: MongoDB connected");

          const user = await User.findOne({ email: credentials?.email });
          if (!user) {
            console.log("Authorize: User not found:", credentials?.email);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) {
            console.log("Authorize: Invalid password for:", credentials?.email);
            return null;
          }

          console.log("Authorize: Success for:", user.email);
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Authorize error:", error.message, error.stack);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT callback:", { token, user });
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback: Token:", token);
      try {
        if (!token) {
          console.log("Session callback: No token provided");
          return session;
        }
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
        console.log("Session callback: Success:", session);
        return session;
      } catch (error) {
        console.error("Session callback error:", error.message, error.stack);
        return session;
      }
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  secret: process.env.AUTH_SECRET,
};

const { handlers, signIn, signOut, auth } = NextAuth(authOptions);

export { handlers as GET, handlers as POST };