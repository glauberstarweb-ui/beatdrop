import pg from "pg";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { sessionId, attemptNumber, guessedText, guessedSongId, isCorrect } = await request.json();

  const db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await db.connect();
    await db.query(
      `INSERT INTO public.guesses (session_id, attempt_number, guessed_text, guessed_song_id, is_correct)
       VALUES ($1, $2, $3, $4, $5)`,
      [sessionId, attemptNumber, guessedText, guessedSongId ?? null, isCorrect]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  } finally {
    await db.end();
  }
}
