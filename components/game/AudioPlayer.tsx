"use client";

import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Play, Square } from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
  startAt: number;
  secondsToReveal: number;
  disabled?: boolean;
}

export function AudioPlayer({
  audioUrl,
  startAt,
  secondsToReveal,
  disabled,
}: AudioPlayerProps) {
  const { isPlaying, progress, play, stop } = useAudioPlayer(audioUrl, startAt);

  const handleToggle = () => {
    if (isPlaying) {
      stop();
    } else {
      play(secondsToReveal);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Waveform visualizer */}
      <div className="flex items-center gap-1 h-16">
        {Array.from({ length: 40 }).map((_, i) => {
          const isActive = isPlaying && (i / 40) * 100 < progress;
          const height = Math.sin(i * 0.4) * 0.5 + 0.5;
          return (
            <div
              key={i}
              className={cn(
                "w-1 rounded-full transition-all duration-100",
                isActive
                  ? "bg-gradient-brand"
                  : "bg-white/20"
              )}
              style={{
                height: `${Math.round(20 + height * 44)}px`,
                animationName: isPlaying ? "waveform" : "none",
                animationDuration: `${0.8 + (i % 4) * 0.15}s`,
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
                animationDelay: `${i * 0.04}s`,
              }}
            />
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-brand transition-all duration-100"
            style={{ width: `${isPlaying ? progress : 0}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-white/40">
          <span>0s</span>
          <span className="text-brand-300 font-medium">{secondsToReveal}s</span>
        </div>
      </div>

      <Button
        size="xl"
        onClick={handleToggle}
        disabled={disabled}
        className="w-24 h-24 rounded-full shadow-2xl shadow-brand-500/40"
      >
        {isPlaying ? (
          <Square className="h-8 w-8 fill-white" />
        ) : (
          <Play className="h-8 w-8 fill-white ml-1" />
        )}
      </Button>

      <p className="text-sm text-white/40">
        {isPlaying ? "Ouvindo…" : "Toque para ouvir o trecho"}
      </p>
    </div>
  );
}
