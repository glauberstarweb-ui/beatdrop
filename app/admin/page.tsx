import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/Card";
import { Music2, Users, Trophy, TrendingUp } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Dashboard" };

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: songCount },
    { count: userCount },
    { count: gameCount },
    { data: recentGames },
  ] = await Promise.all([
    supabase.from("songs").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("game_sessions").select("*", { count: "exact", head: true }),
    supabase
      .from("game_sessions")
      .select("id, status, mode, started_at")
      .order("started_at", { ascending: false })
      .limit(10),
  ]);

  const stats = [
    { label: "Músicas ativas", value: songCount ?? 0, icon: Music2, color: "text-brand-400", bg: "bg-brand-500/10" },
    { label: "Usuários", value: userCount ?? 0, icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Partidas", value: gameCount ?? 0, icon: Trophy, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Taxa de conclusão", value: "—", icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} glass>
            <CardContent className="py-5">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg} mb-3`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <p className="text-2xl font-black text-white">
                {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
              </p>
              <p className="text-xs text-white/40 mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card glass>
        <CardContent className="py-4">
          <h2 className="font-semibold text-white mb-4">Partidas recentes</h2>
          <div className="space-y-2">
            {(recentGames ?? []).map((game) => (
              <div key={game.id} className="flex items-center gap-3 text-sm rounded-xl px-3 py-2.5 hover:bg-white/5">
                <div className={`h-2 w-2 rounded-full ${game.status === "won" ? "bg-emerald-400" : game.status === "lost" ? "bg-red-400" : "bg-white/20"}`} />
                <span className="text-white/60 font-mono text-xs">{game.id.slice(0, 8)}…</span>
                <span className="text-white/40">{game.mode}</span>
                <span className={`ml-auto text-xs font-medium ${game.status === "won" ? "text-emerald-400" : game.status === "lost" ? "text-red-400" : "text-white/30"}`}>
                  {game.status}
                </span>
                <span className="text-white/30 text-xs">
                  {new Date(game.started_at).toLocaleTimeString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
