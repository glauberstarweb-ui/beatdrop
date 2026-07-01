import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Trophy, Medal } from "lucide-react";
import type { Metadata } from "next";
import { Client } from "pg";

export const metadata: Metadata = { title: "Ranking" };
export const revalidate = 60;

const medals = ["🥇", "🥈", "🥉"];

async function getTopScores() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    const { rows } = await client.query(`
      SELECT u.username, SUM(gs.score) as total_score, COUNT(*) as games
      FROM game_sessions gs
      JOIN app_users u ON u.id = gs.user_id
      WHERE gs.status IN ('won','lost') AND gs.user_id IS NOT NULL
      GROUP BY u.username
      ORDER BY total_score DESC
      LIMIT 50
    `);
    return rows as { username: string; total_score: number; games: number }[];
  } catch {
    return [];
  } finally {
    await client.end();
  }
}

export default async function LeaderboardPage() {
  const entries = await getTopScores();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          <Trophy className="h-5 w-5 text-amber-400" />
          <Badge variant="warning">Ranking</Badge>
        </div>
        <h1 className="text-2xl font-bold text-white">Melhores jogadores</h1>
        <p className="mt-1 text-sm text-white/40">Total de pontos acumulados</p>
      </div>

      <Card glass>
        <CardContent className="py-4">
          {entries.length === 0 ? (
            <div className="py-12 text-center text-white/30">
              Nenhum dado ainda. Jogue para aparecer aqui!
            </div>
          ) : (
            <div className="space-y-1">
              {entries.map((entry, i) => (
                <div
                  key={entry.username}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${
                    i < 3 ? "bg-white/5 border border-white/10" : "hover:bg-white/5"
                  }`}
                >
                  <div className="w-8 text-center">
                    {i < 3 ? (
                      <span className="text-xl">{medals[i]}</span>
                    ) : (
                      <span className="text-sm font-bold text-white/30">{i + 1}</span>
                    )}
                  </div>
                  <div className="h-8 w-8 rounded-full bg-brand-500/20 flex items-center justify-center text-sm font-bold text-brand-300">
                    {entry.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{entry.username}</p>
                    <p className="text-xs text-white/30">{entry.games} partidas</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Medal className="h-4 w-4 text-amber-400" />
                    <span className="font-bold text-white tabular-nums">
                      {Number(entry.total_score).toLocaleString("pt-BR")}
                    </span>
                    <span className="text-xs text-white/30">pts</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
