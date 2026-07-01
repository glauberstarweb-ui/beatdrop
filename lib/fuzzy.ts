import Fuse from "fuse.js";
import { normalizeGuess } from "./utils";
import type { SearchResult } from "@/types/game";

let fuseInstance: Fuse<SearchResult> | null = null;

export function initFuse(songs: SearchResult[]) {
  fuseInstance = new Fuse(songs, {
    keys: ["title", "artist_name"],
    threshold: 0.35,
    includeScore: true,
    minMatchCharLength: 2,
    useExtendedSearch: true,
  });
}

export function searchSongs(query: string): SearchResult[] {
  if (!fuseInstance || !query.trim()) return [];
  const results = fuseInstance.search(normalizeGuess(query));
  return results.slice(0, 8).map((r) => r.item);
}

export function isCorrectArtist(guess: string, artistName: string): boolean {
  const normalized = normalizeGuess(guess);
  const normalizedArtist = normalizeGuess(artistName);
  if (normalized.includes(normalizedArtist) || normalizedArtist.includes(normalized)) return true;
  const distance = levenshtein(normalized, normalizedArtist);
  const maxLen = Math.max(normalized.length, normalizedArtist.length);
  return 1 - distance / maxLen >= 0.82;
}

export function isCorrectGuess(
  guess: string,
  songTitle: string,
  artistName: string
): boolean {
  const normalized = normalizeGuess(guess);
  const normalizedTitle = normalizeGuess(songTitle);
  const normalizedArtist = normalizeGuess(artistName);
  const combined = normalizeGuess(`${songTitle} ${artistName}`);

  if (normalized === normalizedTitle) return true;
  if (normalized === combined) return true;

  // Check if guess contains both artist and title keywords
  const titleWords = normalizedTitle.split(/\s+/).filter((w) => w.length > 2);
  const allTitleWordsPresent = titleWords.every((w) => normalized.includes(w));
  if (allTitleWordsPresent && titleWords.length > 0) return true;

  // Levenshtein distance for typo tolerance
  const distance = levenshtein(normalized, normalizedTitle);
  const maxLen = Math.max(normalized.length, normalizedTitle.length);
  const similarity = 1 - distance / maxLen;

  return similarity >= 0.82;
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}
