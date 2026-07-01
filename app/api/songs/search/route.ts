import pg from "pg";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "8"), 20);

  if (!query.trim()) {
    return NextResponse.json([]);
  }

  const db = new pg.Client({
    connectionString: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
  });

  try {
    await db.connect();
    const { rows } = await db.query(
      `SELECT s.id, s.title, a.name as artist_name, al.cover_url as album_cover
       FROM public.songs s
       JOIN public.artists a ON a.id = s.artist_id
       LEFT JOIN public.albums al ON al.id = s.album_id
       WHERE s.is_active = true
         AND (
           s.title ILIKE $1
           OR a.name ILIKE $1
         )
       ORDER BY s.popularity DESC
       LIMIT $2`,
      [`%${query.trim()}%`, limit]
    );
    return NextResponse.json(rows, {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  } finally {
    await db.end();
  }
}
