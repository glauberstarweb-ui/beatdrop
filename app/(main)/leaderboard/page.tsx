import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Trophy, Medal } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ranking" };
export const revalidate = 60;

type Period = "daily" | "weekly" | "monthly" | "all_time";

async function getLeaderboard(period: Period) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leaderboards")
    .select("*, users(username, avatar_url)")
    .eq("period", period)
    .order("score", { ascending: false })
    .limit(50);

  return (data ?? []) as Array<{
    user_id: string;
    score: number;
    rank: number | null;
    users: { username: string | null; avatar_url: string | null };
  }>;
}

const periodLabels: Record<Period, string> = {
  daily: "Hoje",
  weekly: "Semana",
  monthly: "Mês",
  all_time: "Todos os tempos",
};

const medals = ["🥇", "🥈", "🥉"];

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: rawPeriod } = await searchParams;
  const period: Period =
    ["daily", "weekly", "monthly", "all_time"].includes(rawPeriod ?? "")
      ? (rawPeriod as Period)
      : "all_time";

  const entries = await getLeaderboard(period);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          <Trophy className="h-5 w-5 text-amber-400" />
          <Badge variant="warning">Ranking</Badge>
        </div>
        <h1 className="text-2xl font-bold text-white">Melhores jogadores</h1>
      </div>

      {/* Period selector */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {(Object.entries(periodLabels) as [Period, string][]).map(([p, label]) => (
          <a
            key={p}
            href={`?period=${p}`}
            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              p === period
                ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                : "text-white/50 hover:text-white border border-transparent hover:border-white/10"
            }`}
          >
            {label}
          </a>
        ))}
      </div>

      {/* Table */}
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
                  key={entry.user_id}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-all ${
                    i < 3
                      ? "bg-white/5 border border-white/8"
                      : "hover:bg-white/5"
                  }`}
                >
                  <div className="w-8 text-center">
                    {i < 3 ? (
                      <span className="text-xl">{medals[i]}</span>
                    ) : (
                      <span className="text-sm font-bold text-white/30">
                        {i + 1}
                      </span>
                    )}
                  </div>
                  <Avatar
                    src={entry.users.avatar_url}
                    fallback={entry.users.username ?? "?"}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {entry.users.username ?? "Jogador anônimo"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Medal className="h-4 w-4 text-amber-400" />
                    <span className="font-bold text-white tabular-nums">
                      {entry.score.toLocaleString("pt-BR")}
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
