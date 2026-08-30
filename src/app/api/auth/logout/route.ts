import { NextResponse } from "next/server";
import { clearSessionCookieOn } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  return clearSessionCookieOn(response);
}
