import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function buildShareText(
  mode: string,
  attempts: number,
  maxAttempts: number,
  won: boolean,
  score: number
): string {
  const result = won ? `${attempts}/${maxAttempts}` : "X/6";
  const boxes = Array.from({ length: maxAttempts }, (_, i) => {
    if (i < attempts - 1) return "🟥";
    if (i === attempts - 1 && won) return "🟩";
    if (i < attempts) return "🟥";
    return "⬛";
  }).join("");

  return `🎵 BeatDrop ${mode === "daily" ? `#${getDayNumber()}` : mode}
${result} | ${score} pts
${boxes}

beatdrop.app`;
}

function getDayNumber(): number {
  const start = new Date("2024-01-01");
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function normalizeGuess(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}
