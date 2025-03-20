import connectToDatabase from "./lib/mongodb";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
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
            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
              role: user.role, // Include role
            };
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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    // Customize JWT token to include role
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role; // Add role to token
      }
      return token;
    },
    // Customize session to include role from token
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.role = token.role; // Add role to session
      return session;
    },
  },
  async signIn({ user, account, profile }) {
    if (account.provider === "google") {
      try {
        await connectToDatabase();
        let existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          // Create a new user if they don’t exist
          existingUser = new User({
            email: user.email,
            name: user.name,
            role: "user", // Default role
            password: null, // No password for Google users
          });
          await existingUser.save();
        }
        user.id = existingUser._id.toString();
        user.role = existingUser.role;
        return true;
      } catch (error) {
        console.error("Error signing in with Google:", error);
        return false;
      }
    }
    return true; // Continue for Credentials provider
  },
},{
  pages: {
    signIn: "/sign-in", // Custom sign-in page path
  },
  secret: process.env.AUTH_SECRET, // Use secret for JWT
  trustHost: true,
});
