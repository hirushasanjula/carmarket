import connectToDatabase from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import User from "@/models/user";

console.log("NextAuth initialization:", {
  MONGO: !!process.env.MONGO,
  AUTH_SECRET: !!process.env.AUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
});

if (!process.env.AUTH_SECRET) {
  console.error("AUTH_SECRET is missing");
  throw new Error("AUTH_SECRET is required");
}

if (!process.env.MONGO) {
  console.error("MONGO is missing");
  throw new Error("MONGO is required");
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
          return null; // Return null instead of throwing
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
      console.log("Session callback: Starting with token:", token);
      try {
        if (!token) {
          console.log("Session callback: No token provided");
          return session; // Return empty session if no token
        }
        session.user = {
          id: token.id,
          email: token.email,
          name: token.name,
          role: token.role,
        };
        console.log("Session callback: Success:", session);
        return session;
      } catch (error) {
        console.error("Session callback error:", error.message, error.stack);
        return session; // Fallback to avoid 500
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
export { auth }; // Ensure auth is exported