export type GameMode = "daily" | "infinite" | "multiplayer" | "challenge";

export type GameStatus = "idle" | "playing" | "won" | "lost";

export interface SongWithDetails {
  id: string;
  title: string;
  artist_name: string;
  artist_id: string;
  album_title: string | null;
  album_cover: string | null;
  audio_url: string;
  preview_start: number;
  duration: number;
  genres: string[];
  decade: number | null;
}

export interface Guess {
  attempt: number;
  text: string;
  isCorrect: boolean;
  isSkip: boolean;
  isArtistCorrect?: boolean;
}

export interface GameState {
  song: SongWithDetails | null;
  status: GameStatus;
  guesses: Guess[];
  currentAttempt: number;
  secondsRevealed: number;
  score: number;
  isPlaying: boolean;
}

export const ATTEMPT_SECONDS = [1, 2, 4, 7, 11, 16, 21, 27, 30] as const;
export const MAX_ATTEMPTS = 6;
export const ATTEMPT_SCORES = [100, 80, 60, 40, 20, 10] as const;

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar_url: string | null;
  score: number;
}

export interface RoomPlayer {
  user_id: string;
  username: string;
  avatar_url: string | null;
  score: number;
  is_ready: boolean;
  current_attempt: number;
  has_finished: boolean;
}

export interface MultiplayerRoom {
  id: string;
  code: string;
  host_id: string;
  status: "waiting" | "playing" | "finished";
  players: RoomPlayer[];
  current_song_index: number;
  song_ids: string[];
}

export interface SearchResult {
  id: string;
  title: string;
  artist_name: string;
  album_cover: string | null;
}

export interface UserStats {
  total_games: number;
  total_wins: number;
  win_rate: number;
  total_points: number;
  streak_current: number;
  streak_best: number;
  guess_distribution: number[];
  achievements: string[];
}
