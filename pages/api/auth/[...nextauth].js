import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

// Export authOptions for use in API routes
export const authOptions = {
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const client = await clientPromise;
        const db = client.db("realestate");

        const user = await db.collection("users").findOne({ email: credentials.email });

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
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
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
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.image = token.image;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

// Use authOptions in NextAuth
export default NextAuth(authOptions);
