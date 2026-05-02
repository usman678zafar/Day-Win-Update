import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import connectDB from "@/lib/db";
import User from "@/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      if (!user.email) {
        return false;
      }
      await connectDB();
      await User.findOneAndUpdate(
        { email: user.email },
        {
          $set: {
            name: user.name ?? undefined,
            image: user.image ?? undefined,
          },
        },
        { upsert: true, returnDocument: "after" },
      );
      return true;
    },
    async jwt({ token }) {
      const email = token.email;
      if (!email || typeof email !== "string") {
        return token;
      }
      await connectDB();
      const doc = await User.findOne({ email }).select("_id").lean();
      if (doc?._id) {
        token.userId = String(doc._id);
      }
      return token;
    },
  },
});
