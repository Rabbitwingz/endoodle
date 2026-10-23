import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, authMode, authToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const mode = authMode();
  if (mode === "open") return NextResponse.next();

  if (mode === "password") {
    const cookie = req.cookies.get(AUTH_COOKIE)?.value;
    if (cookie && cookie === (await authToken(process.env.APP_PASSWORD!))) {
      return NextResponse.next();
    }
  }

  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/login", req.url));
}

export const config = {
  // Everything except the login page/endpoint and static assets.
  matcher: ["/((?!login|api/login|_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
