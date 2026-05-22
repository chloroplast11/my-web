import { getToken } from "@auth/core/jwt";
import { NextRequest, NextResponse } from "next/server";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLogin = pathname === "/admin/login";

  if (!isLogin) {
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET!,
      secureCookie: process.env.NODE_ENV === "production",
    });

    if (!token) {
      const url = new URL("/admin/login", req.nextUrl);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
