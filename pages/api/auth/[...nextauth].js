// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

export const authOptions = {
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        try {
          const client = await clientPromise;
          const db = client.db("realestate");

          const user = await db.collection("users").findOne({ 
            email: credentials.email 
          });

          if (!user) {
            throw new Error("No account found with this email. Please sign up first.");
          }

          if (!user.password) {
            throw new Error("This account uses Google Sign-In. Please login with Google or add a password.");
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error("Incorrect password. Please try again.");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image || null,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account.provider === "google") {
          const client = await clientPromise;
          const db = client.db("realestate");

          const existingUser = await db.collection("users").findOne({
            email: user.email,
          });

          if (!existingUser) {
            const newUser = await db.collection("users").insertOne({
              email: user.email,
              name: user.name,
              image: user.image || "",
              provider: "google",
              createdAt: new Date(),
            });

            user.id = newUser.insertedId.toString();
          } else {
            user.id = existingUser._id.toString();

            if (existingUser.provider === "credentials") {
              await db.collection("users").updateOne(
                { email: user.email },
                { $set: { provider: "both", image: user.image } }
              );
            }
          }
        }
        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image || null;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.image;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login", // Redirect errors to login page
  },

  secret: process.env.NEXTAUTH_SECRET,
  
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);