import connectToDatabase from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import User from "@/models/user";

console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL); // Debug
console.log("Trust Host Enabled:", true); // Debug

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          await connectToDatabase();
          const user = await User.findOne({ email: credentials?.email });
          if (user && (await bcrypt.compare(credentials.password, user.password))) {
            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
              role: user.role,
            };
          }
          return null;
        } catch (error) {
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role || "user";
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.role = token.role;
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        try {
          await connectToDatabase();
          let existingUser = await User.findOne({ email: user.email });
          if (!existingUser) {
            existingUser = new User({
              email: user.email,
              name: user.name,
              role: "user",
              password: null,
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
      return true;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
});