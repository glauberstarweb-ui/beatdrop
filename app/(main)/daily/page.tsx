import pg from "pg";
import { getTodayDate } from "@/lib/utils";
import { GameBoard } from "@/components/game/GameBoard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Calendar } from "lucide-react";
import type { Metadata } from "next";
import type { SongWithDetails } from "@/types/game";

export const metadata: Metadata = { title: "Modo Diário" };
export const dynamic = "force-dynamic";

async function getDailySong(date: string): Promise<SongWithDetails | null> {
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
      [date]
    );
    return rows[0] ?? null;
  } catch {
    return null;
  } finally {
    await db.end();
  }
}

async function createSession(songId: string, date: string): Promise<string | null> {
  const db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
  });
  try {
    await db.connect();
    const { rows } = await db.query(
      `INSERT INTO public.game_sessions (user_id, song_id, mode, status, attempts_used, score, seconds_revealed, daily_date)
       VALUES (null, $1, 'daily', 'in_progress', 0, 0, 1, $2)
       RETURNING id`,
      [songId, date]
    );
    return rows[0]?.id ?? null;
  } catch {
    return null;
  } finally {
    await db.end();
  }
}

export default async function DailyPage() {
  const today = getTodayDate();
  const song = await getDailySong(today);

  if (!song) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card glass className="max-w-sm text-center p-8">
          <div className="text-4xl mb-4">😴</div>
          <h2 className="text-xl font-bold text-white mb-2">Sem música hoje</h2>
          <p className="text-white/50 text-sm">
            Nenhuma música foi configurada para hoje. Volte mais tarde!
          </p>
        </Card>
      </div>
    );
  }

  const sessionId = await createSession(song.id, today);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          <Calendar className="h-5 w-5 text-blue-400" />
          <Badge variant="default">Modo Diário</Badge>
        </div>
        <h1 className="text-2xl font-bold text-white">Qual é a música de hoje?</h1>
        <p className="mt-1 text-sm text-white/40">
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long", day: "numeric", month: "long",
          })}
        </p>
      </div>

      {sessionId ? (
        <GameBoard song={song} sessionId={sessionId} mode="daily" />
      ) : (
        <p className="text-center text-white/40">Erro ao iniciar a sessão.</p>
      )}
    </div>
  );
}
