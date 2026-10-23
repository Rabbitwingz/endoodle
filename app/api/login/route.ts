import { NextResponse } from "next/server";
import { AUTH_COOKIE, authMode, authToken } from "@/lib/auth";

export async function POST(req: Request) {
  if (authMode() === "misconfigured") {
    return NextResponse.json(
      { error: "APP_PASSWORD is not set on the server. Ask the site owner to configure it." },
      { status: 500 },
    );
  }

  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (authMode() === "password" && password !== process.env.APP_PASSWORD) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, await authToken(process.env.APP_PASSWORD ?? ""), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(AUTH_COOKIE);
  return res;
}
