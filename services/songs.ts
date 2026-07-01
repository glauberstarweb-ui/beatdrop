import type { SongWithDetails, SearchResult } from "@/types/game";

export async function getRandomSong(
  excludeIds: string[] = []
): Promise<SongWithDetails | null> {
  const params = excludeIds.length > 0 ? `?exclude=${excludeIds.join(",")}` : "";
  const res = await fetch(`/api/songs/random${params}`);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data || data.error) return null;
  return data as SongWithDetails;
}

export async function getSongById(id: string): Promise<SongWithDetails | null> {
  const res = await fetch(`/api/songs/${id}`);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data || data.error) return null;
  return data as SongWithDetails;
}

export async function searchSongsServer(
  query: string,
  limit = 8
): Promise<SearchResult[]> {
  const res = await fetch(`/api/songs/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  if (!res.ok) return [];
  return res.json();
}
