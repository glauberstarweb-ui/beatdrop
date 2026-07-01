import pg from "pg";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const exclude = searchParams.get("exclude") ?? "";
  const excludeIds = exclude ? exclude.split(",").filter(Boolean) : [];

  const db = new pg.Client({
    connectionString: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
  });

  try {
    await db.connect();
    const { rows } = await db.query(
      `SELECT s.id, s.title, s.artist_id, a.name as artist_name,
              al.title as album_title, al.cover_url as album_cover,
              s.audio_url, s.preview_start, s.duration, s.genres, s.decade
       FROM public.songs s
       JOIN public.artists a ON a.id = s.artist_id
       LEFT JOIN public.albums al ON al.id = s.album_id
       WHERE s.is_active = true
         AND ($1::uuid[] IS NULL OR s.id <> ALL($1::uuid[]))
       ORDER BY random()
       LIMIT 1`,
      [excludeIds.length > 0 ? excludeIds : null]
    );
    if (!rows[0]) return NextResponse.json(null);
    return NextResponse.json(rows[0]);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  } finally {
    await db.end();
  }
}
