import pg from "pg";
import { NextResponse } from "next/server";
import { getTodayDate } from "@/lib/utils";

export async function GET() {
  const today = getTodayDate();
  const db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await db.connect();
    const { rows } = await db.query(
      `SELECT s.id, s.title, s.artist_id, a.name as artist_name,
              al.title as album_title, al.cover_url as album_cover,
              s.audio_url, s.preview_start, s.duration, s.genres, s.decade
       FROM public.daily_games dg
       JOIN public.songs s ON s.id = dg.song_id
       JOIN public.artists a ON a.id = s.artist_id
       LEFT JOIN public.albums al ON al.id = s.album_id
       WHERE dg.date = $1 AND s.is_active = true
       LIMIT 1`,
      [today]
    );
    return NextResponse.json(rows[0] ?? null, {
      headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  } finally {
    await db.end();
  }
}
