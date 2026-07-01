"use client";

import { useState, useEffect, useCallback } from "react";
import { GameBoard } from "@/components/game/GameBoard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Infinity as InfinityIcon, Trophy, Music } from "lucide-react";
import type { SongWithDetails } from "@/types/game";

export default function InfinitePage() {
  const [song, setSong] = useState<SongWithDetails | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalScore, setTotalScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [key, setKey] = useState(0);

  const loadNextSong = useCallback(async () => {
    setLoading(true);
    try {
      const exclude = history.slice(-20).join(",");
      const params = exclude ? `?exclude=${exclude}` : "";
      const songRes = await fetch(`/api/songs/random${params}`);
      const next: SongWithDetails | null = songRes.ok ? await songRes.json() : null;
      if (!next) { setLoading(false); return; }

      const sessionRes = await fetch("/api/game/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId: next.id, mode: "infinite" }),
      });
      const { id: sid } = await sessionRes.json();

      setSong(next);
      setSessionId(sid);
      setHistory((prev) => [...prev, next.id].slice(-20));
      setKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  }, [history]);

  useEffect(() => { loadNextSong(); }, []); // eslint-disable-line

  const handleGameEnd = (_won: boolean, score: number) => {
    setTotalScore((s) => s + score);
    setGamesPlayed((g) => g + 1);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          <InfinityIcon className="h-5 w-5 text-purple-400" />
          <Badge variant="default">Modo Infinito</Badge>
        </div>
        <h1 className="text-2xl font-bold text-white">Músicas sem fim</h1>
        <p className="mt-1 text-sm text-white/40">Adivinhe quantas quiser, sem limite de tentativas</p>

        {gamesPlayed > 0 && (
          <div className="mt-3 flex justify-center gap-4">
            <div className="flex items-center gap-1.5 text-sm text-white/60">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span className="font-bold text-white">{totalScore}</span> pts
            </div>
            <div className="flex items-center gap-1.5 text-sm text-white/60">
              <Music className="h-4 w-4 text-purple-400" />
              <span className="font-bold text-white">{gamesPlayed}</span>{" "}
              {gamesPlayed === 1 ? "música" : "músicas"}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-12 w-12 rounded-full border-2 border-brand-500/30 border-t-brand-500 animate-spin" />
        </div>
      ) : song && sessionId ? (
        <GameBoard
          key={key}
          song={song}
          sessionId={sessionId}
          mode="infinite"
          maxAttempts={Infinity}
          onPlayAgain={loadNextSong}
          onGameEnd={handleGameEnd}
        />
      ) : (
        <div className="text-center py-20">
          <Card glass className="p-8 max-w-sm mx-auto">
            <p className="text-white/40 mb-4">Não foi possível carregar uma música.</p>
            <Button onClick={loadNextSong}>Tentar novamente</Button>
          </Card>
        </div>
      )}
    </div>
  );
}
