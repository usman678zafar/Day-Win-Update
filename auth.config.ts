import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Edge-safe config only (no Mongoose / Node APIs). Used by middleware.
 * Full callbacks that touch the DB live in auth.ts.
 */
const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [
    Google({
      clientId:
        process.env.AUTH_GOOGLE_ID ??
        process.env.GOOGLE_CLIENT_ID ??
        "",
      clientSecret:
        process.env.AUTH_GOOGLE_SECRET ??
        process.env.GOOGLE_CLIENT_SECRET ??
        "",
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
  },
  callbacks: {
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.userId as string) ?? "";
      }
      return session;
    },
  },
};

export default authConfig;
