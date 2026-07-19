import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/settings",
  "/create",
  "/collections",
  "/admin",
  "/saved",
];

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "moxn-dev-secret-change-me-in-production-please"
);

async function isValid(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((p) => path.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get("moxn_session")?.value;
  if (await isValid(token)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("redirect", path + request.nextUrl.search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/create/:path*",
    "/collections/:path*",
    "/admin/:path*",
    "/saved/:path*",
  ],
};
