"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { isCorrectGuess } from "@/lib/fuzzy";
import { recordGuess, finishGameSession } from "@/services/game";
import {
  ATTEMPT_SECONDS,
  ATTEMPT_SCORES,
  MAX_ATTEMPTS,
  type GameState,
  type SongWithDetails,
  type Guess,
} from "@/types/game";

interface UseGameEngineOptions {
  song: SongWithDetails;
  sessionId: string;
  maxAttempts?: number;
  onGameEnd?: (won: boolean, score: number) => void;
}

export function useGameEngine({
  song,
  sessionId,
  maxAttempts = MAX_ATTEMPTS,
  onGameEnd,
}: UseGameEngineOptions) {
  const [state, setState] = useState<GameState>({
    song,
    status: "playing",
    guesses: [],
    currentAttempt: 1,
    secondsRevealed: ATTEMPT_SECONDS[0],
    score: 0,
    isPlaying: false,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const playSnippet = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(song.audio_url);
    }
    const audio = audioRef.current;
    audio.currentTime = song.preview_start;
    audio.play().catch(() => {});

    setState((s) => ({ ...s, isPlaying: true }));

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      audio.pause();
      setState((s) => ({ ...s, isPlaying: false }));
    }, state.secondsRevealed * 1000);
  }, [song, state.secondsRevealed]);

  const stopPlayback = useCallback(() => {
    audioRef.current?.pause();
    if (timerRef.current) clearTimeout(timerRef.current);
    setState((s) => ({ ...s, isPlaying: false }));
  }, []);

  const submitGuess = useCallback(
    async (guessText: string, guessedSongId: string | null = null, isSkip = false) => {
      if (state.status !== "playing") return;

      const correct =
        !isSkip && isCorrectGuess(guessText, song.title, song.artist_name);

      const newGuess: Guess = {
        attempt: state.currentAttempt,
        text: isSkip ? "" : guessText,
        isCorrect: correct,
        isSkip,
      };

      await recordGuess(
        sessionId,
        state.currentAttempt,
        isSkip ? "[SKIP]" : guessText,
        guessedSongId,
        correct
      );

      const newGuesses = [...state.guesses, newGuess];
      const nextAttempt = state.currentAttempt + 1;
      const nextSecondsRevealed =
        ATTEMPT_SECONDS[Math.min(nextAttempt - 1, ATTEMPT_SECONDS.length - 1)];

      if (correct) {
        const score = ATTEMPT_SCORES[state.currentAttempt - 1] ?? 10;
        await finishGameSession(
          sessionId,
          true,
          state.currentAttempt,
          state.secondsRevealed
        );
        setState((s) => ({
          ...s,
          guesses: newGuesses,
          status: "won",
          score,
        }));
        onGameEnd?.(true, score);
      } else if (nextAttempt > maxAttempts) {
        await finishGameSession(
          sessionId,
          false,
          maxAttempts,
          state.secondsRevealed
        );
        setState((s) => ({
          ...s,
          guesses: newGuesses,
          status: "lost",
          score: 0,
        }));
        onGameEnd?.(false, 0);
      } else {
        setState((s) => ({
          ...s,
          guesses: newGuesses,
          currentAttempt: nextAttempt,
          secondsRevealed: nextSecondsRevealed,
        }));
      }
    },
    [state, song, sessionId, onGameEnd]
  );

  const skipGuess = useCallback(() => {
    submitGuess("", null, true);
  }, [submitGuess]);

  return {
    state,
    playSnippet,
    stopPlayback,
    submitGuess,
    skipGuess,
    audioRef,
  };
}
