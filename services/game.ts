import { ATTEMPT_SCORES } from "@/types/game";

export async function createGameSession(
  songId: string,
  mode: "daily" | "infinite" | "challenge"
): Promise<string | null> {
  try {
    const res = await fetch("/api/game/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ songId, mode }),
    });
    const data = await res.json();
    return data.id ?? null;
  } catch {
    return null;
  }
}

export async function recordGuess(
  sessionId: string,
  attemptNumber: number,
  guessedText: string,
  guessedSongId: string | null,
  isCorrect: boolean
): Promise<void> {
  await fetch("/api/game/guess", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, attemptNumber, guessedText, guessedSongId, isCorrect }),
  }).catch(() => {});
}

export async function finishGameSession(
  sessionId: string,
  won: boolean,
  attemptsUsed: number,
  secondsRevealed: number
): Promise<void> {
  const score = won ? (ATTEMPT_SCORES[attemptsUsed - 1] ?? 10) : 0;
  await fetch("/api/game/finish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, won, attemptsUsed, secondsRevealed, score }),
  }).catch(() => {});
}

export async function getUserDailyResult(
  _userId: string,
  _date: string
): Promise<{ status: string; score: number; attempts_used: number } | null> {
  return null;
}
