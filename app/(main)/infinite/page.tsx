"use client";

import { useState, useEffect, useCallback } from "react";
import { GameBoard } from "@/components/game/GameBoard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Infinity as InfinityIcon, Trophy, Music } from "lucide-react";
import type { SongWithDetails } from "@/types/game";

const CATEGORIES = [
  { label: "Todas", genre: "" },
  { label: "Pop", genre: "Pop" },
  { label: "Rock", genre: "Rock" },
  { label: "Hip-Hop", genre: "Hip-Hop/Rap" },
  { label: "R&B", genre: "R&B/Soul" },
  { label: "Samba / MPB", genre: "MPB" },
  { label: "Sertanejo", genre: "Sertanejo" },
  { label: "Eletrônica", genre: "Electronic" },
  { label: "Reggae", genre: "Reggae" },
  { label: "K-Pop", genre: "K-Pop" },
  { label: "Forró", genre: "Forró" },
  { label: "Trap BR", genre: "Trap" },
];

export default function InfinitePage() {
  const [selectedGenre, setSelectedGenre] = useState("");
  const [song, setSong] = useState<SongWithDetails | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [key, setKey] = useState(0);

  const loadNextSong = useCallback(async (genre: string, currentHistory: string[]) => {
    setLoading(true);
    try {
      const exclude = currentHistory.slice(-20).join(",");
      const params = new URLSearchParams();
      if (exclude) params.set("exclude", exclude);
      if (genre) params.set("genre", genre);

      const songRes = await fetch(`/api/songs/random?${params}`);
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
  }, []);

  const handleStart = (genre: string) => {
    setSelectedGenre(genre);
    setHistory([]);
    setSong(null);
    setGamesPlayed(0);
    setTotalScore(0);
    setStarted(true);
    loadNextSong(genre, []);
  };

  const handlePlayAgain = () => {
    loadNextSong(selectedGenre, history);
  };

  const handleGameEnd = (_won: boolean, score: number) => {
    setTotalScore((s) => s + score);
    setGamesPlayed((g) => g + 1);
  };

  const handleChangeCategory = () => {
    setStarted(false);
    setSong(null);
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

        {started && gamesPlayed > 0 && (
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

      {!started ? (
        /* Category picker */
        <div className="flex flex-col gap-4">
          <p className="text-center text-white/60 text-sm">Escolha uma categoria para começar:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES.map(({ label, genre }) => (
              <button
                key={label}
                onClick={() => handleStart(genre)}
                className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-brand-500/50 transition-all py-4 px-3 text-center group"
              >
                <span className="block text-sm font-semibold text-white group-hover:text-brand-300 transition-colors">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-20">
          <div className="h-12 w-12 rounded-full border-2 border-brand-500/30 border-t-brand-500 animate-spin" />
        </div>
      ) : song && sessionId ? (
        <>
          {/* Category badge + change button */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-white/40">
              Categoria:{" "}
              <span className="text-white/70 font-medium">
                {CATEGORIES.find((c) => c.genre === selectedGenre)?.label ?? "Todas"}
              </span>
            </span>
            <button
              onClick={handleChangeCategory}
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Trocar categoria
            </button>
          </div>

          <GameBoard
            key={key}
            song={song}
            sessionId={sessionId}
            mode="infinite"
            maxAttempts={Infinity}
            onPlayAgain={handlePlayAgain}
            onGameEnd={handleGameEnd}
          />
        </>
      ) : (
        <div className="text-center py-20">
          <Card glass className="p-8 max-w-sm mx-auto">
            <p className="text-white/40 mb-4">Não foi possível carregar uma música.</p>
            <Button onClick={() => loadNextSong(selectedGenre, history)}>Tentar novamente</Button>
          </Card>
        </div>
      )}
    </div>
  );
}
