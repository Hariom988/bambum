import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { MongoClient } from "mongodb";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { z } from "zod";

// MongoDB client for the adapter
const client = new MongoClient(process.env.MONGODB_URI as string);
const clientPromise = client.connect();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const authOptions: NextAuthOptions = {
//   @ts-expect-error 
  adapter: MongoDBAdapter(clientPromise),

  session: {
    strategy: "jwt",
    maxAge: 15 * 60, // 15 min access token
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // 1. Validate shape
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) throw new Error("Invalid input");

        await connectDB();

        // 2. Find user (include password + lock fields)
        const user = await User.findOne({ email: parsed.data.email })
          .select("+password +failedLoginAttempts +lockUntil")
          .lean(false);

        if (!user) {
          // Generic message — don't reveal if email exists
          throw new Error("Invalid email or password");
        }

        // 3. Check lock
        if (user.isLocked()) {
          throw new Error("Account locked. Try again later or reset your password.");
        }

        
        // 5. Compare password
        const valid = await user.comparePassword(parsed.data.password);
        if (!valid) {
          user.failedLoginAttempts += 1;
          if (user.failedLoginAttempts >= MAX_ATTEMPTS) {
            user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
          }
          await user.save();
          throw new Error("Invalid email or password");
        }

        // 6. Reset on success
        user.failedLoginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],

 callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;        
      token.role = user.role;  
    }
    return token;
  },
  async session({ session, token }) {
    session.user.id = token.id;    
    session.user.role = token.role; 
    return session;
  },
},
  pages: {
    signIn: "/auth",
    error: "/auth",
  },

  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "strict",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };