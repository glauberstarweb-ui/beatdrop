import pg from "pg";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { sessionId, won, attemptsUsed, secondsRevealed, score } = await request.json();

  const db = new pg.Client({
    connectionString: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
  });

  try {
    await db.connect();
    await db.query(
      `UPDATE public.game_sessions
       SET status = $1, attempts_used = $2, score = $3, seconds_revealed = $4, finished_at = now()
       WHERE id = $5`,
      [won ? "won" : "lost", attemptsUsed, score ?? 0, secondsRevealed, sessionId]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  } finally {
    await db.end();
  }
}
