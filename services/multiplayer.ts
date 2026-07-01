import { createClient } from "@/lib/supabase/client";
import { generateRoomCode } from "@/lib/utils";
import type { MultiplayerRoom } from "@/types/game";

export async function createRoom(
  hostId: string,
  songIds: string[]
): Promise<string | null> {
  const supabase = createClient();
  const code = generateRoomCode();

  const { data, error } = await supabase
    .from("multiplayer_rooms")
    .insert({
      code,
      host_id: hostId,
      status: "waiting",
      current_song_index: 0,
      song_ids: songIds,
      settings: { max_players: 8, round_duration: 30 },
    })
    .select("id")
    .single();

  if (error) return null;

  await supabase.from("room_players").insert({
    room_id: data.id,
    user_id: hostId,
    score: 0,
    is_ready: false,
  });

  return data.id;
}

export async function joinRoom(
  code: string,
  userId: string
): Promise<{ roomId: string; code: string } | null> {
  const supabase = createClient();
  const { data: room } = await supabase
    .from("multiplayer_rooms")
    .select("id, code, status")
    .eq("code", code.toUpperCase())
    .eq("status", "waiting")
    .single();

  if (!room) return null;

  const { error } = await supabase.from("room_players").upsert(
    {
      room_id: room.id,
      user_id: userId,
      score: 0,
      is_ready: false,
    },
    { onConflict: "room_id,user_id" }
  );

  if (error) return null;
  return { roomId: room.id, code: room.code };
}

export async function getRoomWithPlayers(
  roomId: string
): Promise<MultiplayerRoom | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("multiplayer_rooms")
    .select(
      `*, room_players(*, users(username, avatar_url))`
    )
    .eq("id", roomId)
    .single();

  if (!data) return null;

  const row = data as never as {
    id: string;
    code: string;
    host_id: string;
    status: "waiting" | "playing" | "finished";
    current_song_index: number;
    song_ids: string[];
    room_players: Array<{
      user_id: string;
      score: number;
      is_ready: boolean;
      users: { username: string | null; avatar_url: string | null };
    }>;
  };

  return {
    id: row.id,
    code: row.code,
    host_id: row.host_id,
    status: row.status,
    current_song_index: row.current_song_index,
    song_ids: row.song_ids,
    players: row.room_players.map((p) => ({
      user_id: p.user_id,
      username: p.users.username ?? "Anônimo",
      avatar_url: p.users.avatar_url,
      score: p.score,
      is_ready: p.is_ready,
      current_attempt: 0,
      has_finished: false,
    })),
  };
}

export async function startRoom(roomId: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("multiplayer_rooms")
    .update({ status: "playing" })
    .eq("id", roomId);
}

export async function updatePlayerScore(
  roomId: string,
  userId: string,
  score: number
): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("room_players")
    .update({ score })
    .eq("room_id", roomId)
    .eq("user_id", userId);
}

export function subscribeToRoom(
  roomId: string,
  onUpdate: (room: MultiplayerRoom) => void
) {
  const supabase = createClient();
  return supabase
    .channel(`room:${roomId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "room_players", filter: `room_id=eq.${roomId}` },
      async () => {
        const room = await getRoomWithPlayers(roomId);
        if (room) onUpdate(room);
      }
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "multiplayer_rooms", filter: `id=eq.${roomId}` },
      async () => {
        const room = await getRoomWithPlayers(roomId);
        if (room) onUpdate(room);
      }
    )
    .subscribe();
}
