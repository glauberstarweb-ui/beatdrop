export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          streak_current: number;
          streak_best: number;
          total_games: number;
          total_wins: number;
          total_points: number;
          achievements: string[];
        };
        Insert: Omit<
          Database["public"]["Tables"]["users"]["Row"],
          "created_at" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      artists: {
        Row: {
          id: string;
          name: string;
          slug: string;
          image_url: string | null;
          genres: string[];
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["artists"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["artists"]["Insert"]>;
      };
      albums: {
        Row: {
          id: string;
          title: string;
          artist_id: string;
          cover_url: string | null;
          release_year: number | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["albums"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["albums"]["Insert"]>;
      };
      songs: {
        Row: {
          id: string;
          title: string;
          artist_id: string;
          album_id: string | null;
          audio_url: string;
          preview_start: number;
          duration: number;
          genres: string[];
          decade: number | null;
          popularity: number;
          play_count: number;
          created_at: string;
          updated_at: string;
          is_active: boolean;
          search_vector: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["songs"]["Row"],
          "id" | "created_at" | "updated_at" | "play_count" | "search_vector"
        >;
        Update: Partial<Database["public"]["Tables"]["songs"]["Insert"]>;
      };
      game_sessions: {
        Row: {
          id: string;
          user_id: string | null;
          song_id: string;
          mode: "daily" | "infinite" | "challenge";
          status: "in_progress" | "won" | "lost";
          attempts_used: number;
          score: number;
          seconds_revealed: number;
          started_at: string;
          finished_at: string | null;
          daily_date: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["game_sessions"]["Row"],
          "id" | "started_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["game_sessions"]["Insert"]
        >;
      };
      guesses: {
        Row: {
          id: string;
          session_id: string;
          attempt_number: number;
          guessed_song_id: string | null;
          guessed_text: string;
          is_correct: boolean;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["guesses"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["guesses"]["Insert"]>;
      };
      daily_games: {
        Row: {
          id: string;
          date: string;
          song_id: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["daily_games"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["daily_games"]["Insert"]>;
      };
      multiplayer_rooms: {
        Row: {
          id: string;
          code: string;
          host_id: string;
          status: "waiting" | "playing" | "finished";
          current_song_index: number;
          song_ids: string[];
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["multiplayer_rooms"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["multiplayer_rooms"]["Insert"]
        >;
      };
      room_players: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          score: number;
          is_ready: boolean;
          joined_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["room_players"]["Row"],
          "id" | "joined_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["room_players"]["Insert"]
        >;
      };
      leaderboards: {
        Row: {
          id: string;
          user_id: string;
          period: "daily" | "weekly" | "monthly" | "all_time";
          score: number;
          rank: number | null;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["leaderboards"]["Row"],
          "id" | "updated_at"
        >;
        Update: Partial<Database["public"]["Tables"]["leaderboards"]["Insert"]>;
      };
      challenges: {
        Row: {
          id: string;
          creator_id: string;
          song_ids: string[];
          code: string;
          created_at: string;
          expires_at: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["challenges"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["challenges"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_daily_song: {
        Args: { target_date: string };
        Returns: Database["public"]["Tables"]["songs"]["Row"] & {
          artist_name: string;
          album_cover: string | null;
        };
      };
      get_random_song: {
        Args: { exclude_ids: string[] };
        Returns: Database["public"]["Tables"]["songs"]["Row"] & {
          artist_name: string;
          album_cover: string | null;
        };
      };
      search_songs: {
        Args: { query: string; limit_count: number };
        Returns: Array<{
          id: string;
          title: string;
          artist_name: string;
          album_cover: string | null;
        }>;
      };
      upsert_leaderboard: {
        Args: { p_user_id: string; p_score: number; p_period: string };
        Returns: void;
      };
    };
    Enums: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
