"use client";

import { useState } from "react";
import { useGameEngine } from "@/hooks/useGameEngine";
import { AudioPlayer } from "./AudioPlayer";
import { GuessInput } from "./GuessInput";
import { AttemptTracker } from "./AttemptTracker";
import { GameResult } from "./GameResult";
import { Modal } from "@/components/ui/Modal";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Eye } from "lucide-react";
import { finishGameSession } from "@/services/game";
import type { SongWithDetails } from "@/types/game";

interface GameBoardProps {
  song: SongWithDetails;
  sessionId: string;
  mode: "daily" | "infinite" | "challenge";
  maxAttempts?: number;
  onPlayAgain?: () => void;
  onGameEnd?: (won: boolean, score: number) => void;
}

export function GameBoard({ song, sessionId, mode, maxAttempts, onPlayAgain, onGameEnd }: GameBoardProps) {
  const [showResult, setShowResult] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  const { state, submitGuess, skipGuess } = useGameEngine({
    song,
    sessionId,
    maxAttempts,
    onGameEnd: (won, score) => {
      setGameEnded(true);
      onGameEnd?.(won, score);
      setTimeout(() => setShowResult(true), 1000);
    },
  });

  const handleReveal = async () => {
    await finishGameSession(sessionId, false, state.currentAttempt, state.secondsRevealed);
    setGameEnded(true);
    onGameEnd?.(false, 0);
    setShowResult(true);
  };

  const handlePlayAgain = () => {
    setShowResult(false);
    setGameEnded(false);
    onPlayAgain?.();
  };

  return (
    <>
      <div className="flex flex-col gap-6 w-full max-w-lg mx-auto">
        <Card glass glow>
          <CardContent className="flex flex-col items-center gap-6 py-8">
            <AudioPlayer
              audioUrl={song.audio_url}
              startAt={song.preview_start}
              secondsToReveal={state.secondsRevealed}
              disabled={gameEnded}
            />
          </CardContent>
        </Card>

        <AttemptTracker
          guesses={state.guesses}
          currentAttempt={state.currentAttempt}
        />

        {!gameEnded && (
          <>
            <GuessInput
              onGuess={submitGuess}
              onSkip={skipGuess}
              disabled={gameEnded}
            />
            <button
              onClick={handleReveal}
              className="text-xs text-white/25 hover:text-white/50 transition-colors mx-auto"
            >
              Revelar resposta
            </button>
          </>
        )}
      </div>

      <Modal
        isOpen={showResult}
        onClose={() => setShowResult(false)}
        size="md"
      >
        <div className="p-6">
          <GameResult
            song={song}
            won={state.status === "won"}
            attemptsUsed={state.currentAttempt}
            score={state.score}
            mode={mode}
            onPlayAgain={handlePlayAgain}
            showPlayAgain={mode !== "daily"}
          />
        </div>
      </Modal>
    </>
  );
}
