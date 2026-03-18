import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { SupabaseAdapter } from "@auth/supabase-adapter";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: supabaseUrl && supabaseServiceKey
    ? SupabaseAdapter({ url: supabaseUrl, secret: supabaseServiceKey })
    : undefined,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnApp = nextUrl.pathname.startsWith("/week") ||
        nextUrl.pathname.startsWith("/today") ||
        nextUrl.pathname.startsWith("/inbox") ||
        nextUrl.pathname.startsWith("/settings");

      if (isOnApp) {
        if (isLoggedIn) return true;
        return false;
      }
      return true;
    },
  },
});
