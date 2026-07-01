import pg from "pg";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { songId, mode } = await request.json();
  if (!songId || !mode) return NextResponse.json({ error: "missing params" }, { status: 400 });

  const db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await db.connect();
    const { rows } = await db.query(
      `INSERT INTO public.game_sessions (user_id, song_id, mode, status, attempts_used, score, seconds_revealed)
       VALUES (null, $1, $2, 'in_progress', 0, 0, 1)
       RETURNING id`,
      [songId, mode]
    );
    return NextResponse.json({ id: rows[0].id });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  } finally {
    await db.end();
  }
}
