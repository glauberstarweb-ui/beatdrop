import { cn } from "@/lib/utils";
import { ATTEMPT_SECONDS, MAX_ATTEMPTS, type Guess } from "@/types/game";
import { Check, X, SkipForward } from "lucide-react";

interface AttemptTrackerProps {
  guesses: Guess[];
  currentAttempt: number;
}

export function AttemptTracker({ guesses, currentAttempt }: AttemptTrackerProps) {
  return (
    <div className="w-full space-y-2">
      {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => {
        const guess = guesses[i];
        const attemptNum = i + 1;
        const isCurrent = attemptNum === currentAttempt && !guess;
        const isPast = i < guesses.length;
        const isFuture = !isPast && !isCurrent;
        const seconds = ATTEMPT_SECONDS[i];

        return (
          <div
            key={i}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-2.5 border transition-all duration-300",
              guess?.isCorrect
                ? "bg-emerald-500/10 border-emerald-500/30"
                : guess?.isArtistCorrect
                ? "bg-amber-500/10 border-amber-500/30"
                : guess && !guess.isSkip
                ? "bg-red-500/10 border-red-500/30"
                : guess?.isSkip
                ? "bg-white/5 border-white/10"
                : isCurrent
                ? "bg-brand-500/10 border-brand-500/40 shadow-lg shadow-brand-500/10"
                : "bg-white/3 border-white/5"
            )}
          >
            {/* Status icon */}
            <div
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                guess?.isCorrect
                  ? "bg-emerald-500 text-white"
                  : guess?.isArtistCorrect
                  ? "bg-amber-500 text-white"
                  : guess && !guess.isSkip
                  ? "bg-red-500 text-white"
                  : guess?.isSkip
                  ? "bg-white/20 text-white/50"
                  : isCurrent
                  ? "bg-brand-500 text-white"
                  : "bg-white/10 text-white/30"
              )}
            >
              {guess?.isCorrect ? (
                <Check className="h-3.5 w-3.5" />
              ) : guess && !guess.isSkip ? (
                <X className="h-3.5 w-3.5" />
              ) : guess?.isSkip ? (
                <SkipForward className="h-3 w-3" />
              ) : (
                attemptNum
              )}
            </div>

            {/* Guess text or placeholder */}
            <div className="flex-1 min-w-0">
              {guess ? (
                <p
                  className={cn(
                    "text-sm truncate",
                    guess.isCorrect
                      ? "text-emerald-300 font-medium"
                      : guess.isArtistCorrect
                      ? "text-amber-300"
                      : guess.isSkip
                      ? "text-white/30 italic"
                      : "text-red-300"
                  )}
                >
                  {guess.isSkip ? "Pulado" : guess.text}
                </p>
              ) : (
                <p className="text-sm text-white/20">
                  {isCurrent ? "Tentativa atual" : "—"}
                </p>
              )}
            </div>

            {/* Seconds badge */}
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-xs font-mono",
                isCurrent
                  ? "bg-brand-500/30 text-brand-300"
                  : isFuture
                  ? "bg-white/5 text-white/20"
                  : "bg-white/10 text-white/40"
              )}
            >
              {seconds}s
            </span>
          </div>
        );
      })}
    </div>
  );
}
