import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ deezerId: string }> }
) {
  const { deezerId } = await params;

  try {
    const res = await fetch(`https://api.deezer.com/track/${deezerId}`);
    if (!res.ok) return NextResponse.json({ error: "not found" }, { status: 404 });

    const data = await res.json();
    if (!data.preview) return NextResponse.json({ error: "no preview" }, { status: 404 });

    return NextResponse.redirect(data.preview, { status: 302 });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
