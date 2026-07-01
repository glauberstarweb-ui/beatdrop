"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getRoomWithPlayers, startRoom, subscribeToRoom, updatePlayerScore } from "@/services/multiplayer";
import { getSongById } from "@/services/songs";
import { createGameSession } from "@/services/game";
import { useUser } from "@/hooks/useUser";
import { GameBoard } from "@/components/game/GameBoard";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Users, Crown, Copy, Trophy } from "lucide-react";
import type { MultiplayerRoom, SongWithDetails } from "@/types/game";
import { toast } from "react-hot-toast";
import type { RealtimeChannel } from "@supabase/supabase-js";

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useUser();
  const [room, setRoom] = useState<MultiplayerRoom | null>(null);
  const [currentSong, setCurrentSong] = useState<SongWithDetails | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameKey, setGameKey] = useState(0);

  useEffect(() => {
    let channel: RealtimeChannel;

    async function init() {
      const r = await getRoomWithPlayers(roomId);
      setRoom(r);
      setLoading(false);

      channel = subscribeToRoom(roomId, (updated) => {
        setRoom(updated);
      });
    }

    init();
    return () => { channel?.unsubscribe(); };
  }, [roomId]);

  useEffect(() => {
    if (!room || room.status !== "playing") return;
    const songId = room.song_ids[room.current_song_index];
    if (!songId) return;

    getSongById(songId).then(async (song) => {
      if (!song) return;
      setCurrentSong(song);
      const sid = await createGameSession(song.id, "infinite");
      setSessionId(sid);
      setGameKey((k) => k + 1);
    });
  }, [room?.status, room?.current_song_index]); // eslint-disable-line

  const isHost = user?.id === room?.host_id;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room?.code ?? "");
    toast.success("Código copiado!");
  };

  const handleStart = async () => {
    await startRoom(roomId);
  };

  const handleGameEnd = async (won: boolean, score: number) => {
    if (!user || !room) return;
    const me = room.players.find((p) => p.user_id === user.id);
    const newScore = (me?.score ?? 0) + (won ? score : 0);
    await updatePlayerScore(roomId, user.id, newScore);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-12 w-12 rounded-full border-2 border-brand-500/30 border-t-brand-500 animate-spin" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex justify-center py-20 text-white/40">
        Sala não encontrada.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-5 w-5 text-emerald-400" />
            <Badge variant="success">Multiplayer</Badge>
            <Badge variant="secondary">{room.status === "waiting" ? "Aguardando" : room.status === "playing" ? "Em jogo" : "Finalizado"}</Badge>
          </div>
          <h1 className="text-2xl font-bold text-white">Sala de jogo</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-white/10 bg-surface-700 px-4 py-2 font-mono text-xl font-bold tracking-widest text-white">
            {room.code}
          </div>
          <Button variant="outline" size="icon" onClick={handleCopyCode}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Player list / leaderboard */}
        <div className="md:col-span-1">
          <Card glass>
            <CardContent className="py-4">
              <h2 className="font-semibold text-white/70 text-sm mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4" /> Jogadores
              </h2>
              <div className="space-y-2">
                {[...room.players]
                  .sort((a, b) => b.score - a.score)
                  .map((player, i) => (
                    <div
                      key={player.user_id}
                      className="flex items-center gap-3 rounded-xl p-2 hover:bg-white/5"
                    >
                      <span className="w-5 text-center text-xs font-bold text-white/30">
                        {i + 1}
                      </span>
                      <Avatar
                        src={player.avatar_url}
                        fallback={player.username}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate flex items-center gap-1">
                          {player.username}
                          {player.user_id === room.host_id && (
                            <Crown className="h-3 w-3 text-amber-400" />
                          )}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-brand-300">
                        {player.score}
                      </span>
                    </div>
                  ))}
              </div>

              {room.status === "waiting" && isHost && (
                <Button
                  className="w-full mt-4"
                  onClick={handleStart}
                  disabled={room.players.length < 2}
                >
                  Iniciar jogo
                </Button>
              )}

              {room.status === "waiting" && !isHost && (
                <p className="mt-4 text-center text-sm text-white/30">
                  Aguardando o host iniciar…
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Game area */}
        <div className="md:col-span-2">
          {room.status === "waiting" ? (
            <Card glass className="flex min-h-[300px] items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-4">🎵</div>
                <p className="text-white/40">
                  {isHost
                    ? "Adicione mais jogadores e inicie o jogo."
                    : "O jogo começa em breve…"}
                </p>
              </div>
            </Card>
          ) : currentSong && sessionId ? (
            <GameBoard
              key={gameKey}
              song={currentSong}
              sessionId={sessionId}
              mode="infinite"
              onPlayAgain={undefined}
            />
          ) : (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 rounded-full border-2 border-brand-500/30 border-t-brand-500 animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
