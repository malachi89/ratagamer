import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { getAuthSecret, SESSION_COOKIE } from "@/lib/constants";

const protectedPrefixes = ["/dashboard", "/games", "/api/files"];
const loginPath = "/login";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedPrefixes.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );
  const isLoginPage = pathname === loginPath;

  let isAuthed = false;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, getAuthSecret());
      isAuthed = typeof payload.sub === "string" && payload.sub.length > 0;
    } catch {
      isAuthed = false;
    }
  }

  if (isProtected && !isAuthed) {
    const url = request.nextUrl.clone();
    url.pathname = loginPath;
    return NextResponse.redirect(url);
  }

  if (isLoginPage && isAuthed) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/games/:path*",
    "/api/files/:path*",
    "/login",
  ],
};
