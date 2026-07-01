"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoom, joinRoom } from "@/services/multiplayer";
import { getRandomSong } from "@/services/songs";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Users, Plus, LogIn } from "lucide-react";
import Link from "next/link";

export default function MultiplayerPage() {
  const { user } = useUser();
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card glass className="max-w-sm text-center p-8">
          <Users className="h-10 w-10 text-brand-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">
            Login necessário
          </h2>
          <p className="text-white/50 text-sm mb-6">
            Para jogar no multiplayer você precisa estar logado.
          </p>
          <Link href="/login">
            <Button className="w-full">Entrar</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleCreate = async () => {
    setLoading(true);
    setError("");
    try {
      const songs = await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          getRandomSong(i === 0 ? [] : []).then((s) => s?.id).then((id) => id ?? null)
        )
      );
      const songIds = songs.filter(Boolean) as string[];
      if (songIds.length === 0) throw new Error("Não há músicas disponíveis");

      const roomId = await createRoom(user.id, songIds);
      if (!roomId) throw new Error("Erro ao criar sala");

      router.push(`/multiplayer/${roomId}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!roomCode.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await joinRoom(roomCode, user.id);
      if (!result) throw new Error("Sala não encontrada ou já iniciada");
      router.push(`/multiplayer/${result.roomId}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          <Users className="h-5 w-5 text-emerald-400" />
          <Badge variant="success">Multiplayer</Badge>
        </div>
        <h1 className="text-2xl font-bold text-white">Jogue com amigos</h1>
        <p className="mt-1 text-sm text-white/40">
          Crie uma sala ou entre com um código
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Create room */}
        <Card glass glow>
          <CardContent className="flex flex-col gap-4 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
                <Plus className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-white">Criar sala</p>
                <p className="text-sm text-white/40">
                  Gere um código e convide seus amigos
                </p>
              </div>
            </div>
            <Button
              onClick={handleCreate}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Criando…" : "Criar sala"}
            </Button>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/30">ou</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Join room */}
        <Card glass>
          <CardContent className="flex flex-col gap-4 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20">
                <LogIn className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-white">Entrar em sala</p>
                <p className="text-sm text-white/40">
                  Use o código compartilhado pelo host
                </p>
              </div>
            </div>
            <Input
              placeholder="CÓDIGO DA SALA"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="font-mono text-center text-lg tracking-widest uppercase"
            />
            <Button
              variant="secondary"
              onClick={handleJoin}
              disabled={loading || roomCode.length < 6}
              className="w-full"
            >
              {loading ? "Entrando…" : "Entrar na sala"}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <p className="text-center text-sm text-red-400">{error}</p>
        )}
      </div>
    </div>
  );
}
