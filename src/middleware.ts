export { auth as middleware } from "@/lib/auth/config";

export const config = {
  matcher: ["/week/:path*", "/today/:path*", "/inbox/:path*", "/settings/:path*"],
};
