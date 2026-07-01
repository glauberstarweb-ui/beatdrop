import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  const username = cookieStore.get("username")?.value;
  if (!userId) return NextResponse.json(null);
  return NextResponse.json({ id: userId, username });
}
