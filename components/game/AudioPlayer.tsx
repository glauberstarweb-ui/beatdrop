"use client";

import { useEffect, useRef } from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Play, Square } from "lucide-react";
import { ATTEMPT_SECONDS } from "@/types/game";

const MAX_SECONDS = 30;

interface AudioPlayerProps {
  audioUrl: string;
  secondsToReveal: number;
  attempt: number;
  disabled?: boolean;
}

export function AudioPlayer({ audioUrl, secondsToReveal, attempt, disabled }: AudioPlayerProps) {
  const { isPlaying, progress, play, stop } = useAudioPlayer(audioUrl);
  const prevAttemptRef = useRef(attempt);

  // Auto-play when attempt increases (after wrong guess or skip)
  useEffect(() => {
    if (attempt > 1 && attempt > prevAttemptRef.current) {
      const t = setTimeout(() => play(secondsToReveal), 400);
      return () => clearTimeout(t);
    }
    prevAttemptRef.current = attempt;
  }, [attempt]); // eslint-disable-line

  // Stop when game ends
  useEffect(() => {
    if (disabled) stop();
  }, [disabled, stop]);

  const handleToggle = () => {
    if (isPlaying) stop();
    else play(secondsToReveal);
  };

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Segment bar — shows unlocked portions */}
      <div className="w-full max-w-xs flex flex-col gap-1.5">
        <div className="flex gap-1 items-end h-10">
          {ATTEMPT_SECONDS.map((seg, i) => {
            const unlocked = seg <= secondsToReveal;
            const isCurrent = seg === secondsToReveal;
            return (
              <div
                key={seg}
                className="flex-1 rounded-sm transition-all duration-300"
                style={{
                  height: `${20 + i * 5}px`,
                  background: unlocked
                    ? isCurrent
                      ? "linear-gradient(to top, #a855f7, #6366f1)"
                      : "rgba(168,85,247,0.35)"
                    : "rgba(255,255,255,0.08)",
                }}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-white/30">
          <span>0s</span>
          <span className={cn("font-medium", isPlaying ? "text-brand-300" : "text-white/40")}>
            {secondsToReveal}s revelados
          </span>
          <span>30s</span>
        </div>
      </div>

      {/* Waveform */}
      <div className="flex items-center gap-0.5 h-12">
        {Array.from({ length: 40 }).map((_, i) => {
          const posRatio = i / 40;
          const revealRatio = secondsToReveal / MAX_SECONDS;
          const isRevealed = posRatio < revealRatio;
          const isActive = isPlaying && (posRatio * 100) < progress;
          const height = Math.round(20 + (Math.sin(i * 0.4) * 0.5 + 0.5) * 28);
          return (
            <div
              key={i}
              className="w-1 rounded-full transition-colors duration-200"
              style={{
                height: `${height}px`,
                background: isActive
                  ? "linear-gradient(to top, #a855f7, #6366f1)"
                  : isRevealed
                  ? "rgba(168,85,247,0.45)"
                  : "rgba(255,255,255,0.1)",
                animationName: isPlaying && isRevealed ? "waveform" : "none",
                animationDuration: `${0.8 + (i % 4) * 0.15}s`,
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
                animationDelay: `${i * 0.04}s`,
              }}
            />
          );
        })}
      </div>

      <Button
        size="xl"
        onClick={handleToggle}
        disabled={disabled}
        className="w-24 h-24 rounded-full shadow-2xl shadow-brand-500/40"
      >
        {isPlaying
          ? <Square className="h-8 w-8 fill-white" />
          : <Play className="h-8 w-8 fill-white ml-1" />}
      </Button>

      <p className="text-sm text-white/40">
        {isPlaying
          ? "Ouvindo…"
          : attempt === 1
          ? "Toque para ouvir o primeiro trecho"
          : `Tentativa ${attempt} — ${secondsToReveal}s desbloqueados`}
      </p>
    </div>
  );
}
