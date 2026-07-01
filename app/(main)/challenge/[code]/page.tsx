"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getSongById } from "@/services/songs";
import { createGameSession } from "@/services/game";
import { GameBoard } from "@/components/game/GameBoard";
import { Badge } from "@/components/ui/Badge";
import { Zap } from "lucide-react";
import type { SongWithDetails } from "@/types/game";

export default function ChallengePlayPage() {
  const { code } = useParams<{ code: string }>();
  const [songs, setSongs] = useState<SongWithDetails[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState(0);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("challenges")
        .select("song_ids")
        .eq("code", code)
        .single();

      if (!data) { setLoading(false); return; }

      const loaded = await Promise.all(
        (data.song_ids as string[]).map((id: string) => getSongById(id))
      );
      const validSongs = loaded.filter(Boolean) as SongWithDetails[];
      setSongs(validSongs);

      if (validSongs[0]) {
        const sid = await createGameSession(validSongs[0].id, "challenge");
        setSessionId(sid);
      }
      setLoading(false);
    }
    load();
  }, [code]);

  const handleNext = async () => {
    const next = currentIndex + 1;
    if (next >= songs.length) return;
    const sid = await createGameSession(songs[next].id, "challenge");
    setSessionId(sid);
    setCurrentIndex(next);
    setKey((k) => k + 1);
  };

  const currentSong = songs[currentIndex];
  const isLast = currentIndex === songs.length - 1;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          <Zap className="h-5 w-5 text-amber-400" />
          <Badge variant="warning">Desafio</Badge>
        </div>
        <h1 className="text-2xl font-bold text-white">
          Música {currentIndex + 1} de {songs.length || "…"}
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-12 w-12 rounded-full border-2 border-brand-500/30 border-t-brand-500 animate-spin" />
        </div>
      ) : currentSong && sessionId ? (
        <GameBoard
          key={key}
          song={currentSong}
          sessionId={sessionId}
          mode="challenge"
          onPlayAgain={isLast ? undefined : handleNext}
        />
      ) : (
        <div className="text-center py-20 text-white/40">
          Desafio não encontrado ou expirado.
        </div>
      )}
    </div>
  );
}
