"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { buildShareText } from "@/lib/utils";
import { Share2, RotateCcw, Trophy } from "lucide-react";
import type { SongWithDetails } from "@/types/game";
import { toast } from "react-hot-toast";

interface GameResultProps {
  song: SongWithDetails;
  won: boolean;
  attemptsUsed: number;
  score: number;
  mode: string;
  onPlayAgain?: () => void;
  showPlayAgain?: boolean;
}

export function GameResult({
  song,
  won,
  attemptsUsed,
  score,
  mode,
  onPlayAgain,
  showPlayAgain = true,
}: GameResultProps) {
  const handleShare = async () => {
    const text = buildShareText(mode, attemptsUsed, 6, won, score);
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copiado para a área de transferência!");
    } catch {
      toast.error("Não foi possível copiar.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 py-4 animate-fade-in">
      {/* Result header */}
      <div className="text-center">
        <div className="text-5xl mb-2">{won ? "🎉" : "😔"}</div>
        <h2 className="text-2xl font-bold text-white">
          {won ? "Acertou!" : "Não foi dessa vez…"}
        </h2>
        {won && (
          <div className="mt-2 flex items-center justify-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            <span className="text-xl font-bold text-amber-400">{score} pts</span>
            <Badge variant="warning">Tentativa {attemptsUsed}/6</Badge>
          </div>
        )}
      </div>

      {/* Album art + song info */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-48 w-48 overflow-hidden rounded-2xl shadow-2xl border border-white/10">
          {song.album_cover ? (
            <Image
              src={song.album_cover}
              alt={song.title}
              fill
              className="object-cover"
              sizes="192px"
            />
          ) : (
            <div className="w-full h-full bg-gradient-brand flex items-center justify-center">
              <span className="text-5xl">🎵</span>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-xl font-bold text-white">{song.title}</p>
          <p className="text-white/60">{song.artist_name}</p>
          {song.album_title && (
            <p className="text-sm text-white/40 mt-0.5">{song.album_title}</p>
          )}
          <div className="mt-2 flex flex-wrap justify-center gap-1.5">
            {song.genres.slice(0, 3).map((g) => (
              <Badge key={g} variant="secondary">
                {g}
              </Badge>
            ))}
            {song.decade && (
              <Badge variant="secondary">{song.decade}s</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
          Compartilhar
        </Button>
        {showPlayAgain && onPlayAgain && (
          <Button onClick={onPlayAgain}>
            <RotateCcw className="h-4 w-4" />
            Jogar novamente
          </Button>
        )}
      </div>
    </div>
  );
}
