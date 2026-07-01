import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("user_id");
  cookieStore.delete("username");
  return NextResponse.json({ ok: true });
}
