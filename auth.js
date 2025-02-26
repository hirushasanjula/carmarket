import connectToDatabase from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import User from "@/models/user";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt", // Use JWT session strategy
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          // Connect to the database
          await connectToDatabase();

          // Find user by email
          const user = await User.findOne({ email: credentials?.email });

          if (user && await bcrypt.compare(credentials.password, user.password)) {
            // Return user data for session if credentials match
            return user;
          }

          // Return null if user doesn't exist or credentials don't match
          return null;
        } catch (error) {
          // Handle error and return null if authentication fails
          console.log("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/sign-in", // Custom sign-in page path
  },
  secret: process.env.AUTH_SECRET, // Use secret for JWT
});
