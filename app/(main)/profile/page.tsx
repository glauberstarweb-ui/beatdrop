import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { UserCircle, Trophy, Flame, Star, Target } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Perfil" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: recentGames } = await supabase
    .from("game_sessions")
    .select("*, songs(title, artists(name))")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(10);

  const winRate = profile && profile.total_games > 0
    ? Math.round((profile.total_wins / profile.total_games) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Profile header */}
      <Card glass glow className="mb-6">
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <Avatar
              src={profile?.avatar_url}
              fallback={profile?.username ?? user.email ?? "U"}
              size="xl"
            />
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-white">
                {profile?.username ?? "Jogador"}
              </h1>
              <p className="text-white/40 text-sm">{user.email}</p>
              <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                {profile?.achievements?.slice(0, 3).map((a: string) => (
                  <Badge key={a} variant="default">{a}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Partidas", value: profile?.total_games ?? 0, icon: Target, color: "text-blue-400" },
          { label: "Vitórias", value: profile?.total_wins ?? 0, icon: Trophy, color: "text-amber-400" },
          { label: "Taxa de acerto", value: `${winRate}%`, icon: Star, color: "text-emerald-400" },
          { label: "Streak atual", value: profile?.streak_current ?? 0, icon: Flame, color: "text-red-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} glass>
            <CardContent className="py-4 text-center">
              <Icon className={`h-5 w-5 ${color} mx-auto mb-2`} />
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="text-xs text-white/40 mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Total points */}
      <Card glass className="mb-6">
        <CardContent className="py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20">
              <Trophy className="h-5 w-5 text-brand-400" />
            </div>
            <div>
              <p className="text-sm text-white/50">Pontuação total</p>
              <p className="text-xl font-black text-white">
                {(profile?.total_points ?? 0).toLocaleString("pt-BR")} pts
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/30">Melhor streak</p>
            <p className="text-lg font-bold text-white">
              {profile?.streak_best ?? 0} dias 🔥
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent games */}
      <Card glass>
        <CardContent className="py-4">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            Partidas recentes
          </h2>

          {!recentGames || recentGames.length === 0 ? (
            <p className="text-center text-white/30 py-8 text-sm">
              Nenhuma partida ainda. Comece a jogar!
            </p>
          ) : (
            <div className="space-y-2">
              {recentGames.map((game) => {
                const g = game as {
                  id: string; status: string; score: number; mode: string;
                  attempts_used: number; started_at: string;
                  songs: { title: string; artists: { name: string } | null } | null;
                };
                return (
                  <div
                    key={g.id}
                    className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-white/5"
                  >
                    <div
                      className={`h-2 w-2 rounded-full shrink-0 ${
                        g.status === "won"
                          ? "bg-emerald-400"
                          : g.status === "lost"
                          ? "bg-red-400"
                          : "bg-white/20"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">
                        {g.songs?.title ?? "—"}
                      </p>
                      <p className="text-xs text-white/40">
                        {g.songs?.artists?.name ?? ""} ·{" "}
                        {new Date(g.started_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={
                          g.mode === "daily"
                            ? "default"
                            : g.mode === "infinite"
                            ? "secondary"
                            : "warning"
                        }
                      >
                        {g.mode}
                      </Badge>
                      {g.status === "won" && (
                        <span className="text-sm font-bold text-amber-400">
                          +{g.score}
                        </span>
                      )}
                      <span className="text-xs text-white/30">
                        {g.attempts_used}/6
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
