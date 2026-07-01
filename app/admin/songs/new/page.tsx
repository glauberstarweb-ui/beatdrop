"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { toast } from "react-hot-toast";
import type { Metadata } from "next";

export default function NewSongPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    artistName: "",
    albumTitle: "",
    audioUrl: "",
    coverUrl: "",
    previewStart: "0",
    duration: "30",
    genres: "",
    decade: "",
    popularity: "50",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();

    try {
      // Upsert artist
      const { data: artist, error: artistErr } = await supabase
        .from("artists")
        .upsert(
          { name: form.artistName, slug: slugify(form.artistName), genres: [], image_url: null },
          { onConflict: "slug" }
        )
        .select("id")
        .single();
      if (artistErr) throw artistErr;

      // Upsert album if title provided
      let albumId: string | null = null;
      if (form.albumTitle) {
        const { data: album, error: albumErr } = await supabase
          .from("albums")
          .upsert(
            {
              title: form.albumTitle,
              artist_id: artist.id,
              cover_url: form.coverUrl || null,
              release_year: form.decade ? parseInt(form.decade) : null,
            },
            { onConflict: "title,artist_id" }
          )
          .select("id")
          .single();
        if (albumErr) throw albumErr;
        albumId = album.id;
      }

      // Insert song
      const { error: songErr } = await supabase.from("songs").insert({
        title: form.title,
        artist_id: artist.id,
        album_id: albumId,
        audio_url: form.audioUrl,
        preview_start: parseFloat(form.previewStart),
        duration: parseFloat(form.duration),
        genres: form.genres.split(",").map((g) => g.trim()).filter(Boolean),
        decade: form.decade ? parseInt(form.decade) : null,
        popularity: parseInt(form.popularity),
        is_active: true,
      });
      if (songErr) throw songErr;

      toast.success("Música adicionada!");
      router.push("/admin/songs");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">Nova música</h1>

      <Card glass>
        <CardContent className="py-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Título da música *"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                required
              />
              <Input
                label="Artista *"
                value={form.artistName}
                onChange={(e) => set("artistName", e.target.value)}
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Álbum"
                value={form.albumTitle}
                onChange={(e) => set("albumTitle", e.target.value)}
              />
              <Input
                label="URL da capa do álbum"
                value={form.coverUrl}
                onChange={(e) => set("coverUrl", e.target.value)}
                placeholder="https://…"
              />
            </div>

            <Input
              label="URL do áudio *"
              value={form.audioUrl}
              onChange={(e) => set("audioUrl", e.target.value)}
              required
              placeholder="https://…/audio.mp3"
            />

            <div className="grid sm:grid-cols-3 gap-4">
              <Input
                label="Início do preview (segundos)"
                type="number"
                value={form.previewStart}
                onChange={(e) => set("previewStart", e.target.value)}
                min="0"
                step="0.1"
              />
              <Input
                label="Duração (segundos)"
                type="number"
                value={form.duration}
                onChange={(e) => set("duration", e.target.value)}
                min="1"
              />
              <Input
                label="Popularidade (0–100)"
                type="number"
                value={form.popularity}
                onChange={(e) => set("popularity", e.target.value)}
                min="0"
                max="100"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Gêneros (separados por vírgula)"
                value={form.genres}
                onChange={(e) => set("genres", e.target.value)}
                placeholder="Pop, Rock, …"
              />
              <Input
                label="Década (ex: 1990)"
                type="number"
                value={form.decade}
                onChange={(e) => set("decade", e.target.value)}
                placeholder="1990"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Salvando…" : "Salvar música"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
