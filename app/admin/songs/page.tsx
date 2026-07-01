import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin — Músicas" };

export default async function AdminSongsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page: rawPage, q: query } = await searchParams;
  const page = Math.max(1, parseInt(rawPage ?? "1") || 1);
  const limit = 20;
  const offset = (page - 1) * limit;

  const supabase = await createClient();
  let songQuery = supabase
    .from("songs")
    .select("id, title, artists(name), albums(title), is_active, play_count, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (query) songQuery = songQuery.ilike("title", `%${query}%`);

  const { data: songs, count } = await songQuery;
  const totalPages = Math.ceil((count ?? 0) / limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Músicas</h1>
        <Link href="/admin/songs/new">
          <Button>
            <Plus className="h-4 w-4" />
            Adicionar música
          </Button>
        </Link>
      </div>

      {/* Search */}
      <form className="mb-6">
        <input
          name="q"
          defaultValue={query}
          placeholder="Buscar músicas…"
          className="w-full max-w-xs rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-brand-500/50"
        />
      </form>

      <Card glass>
        <CardContent className="py-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="pb-3 pr-4 text-xs font-medium text-white/40">Título</th>
                  <th className="pb-3 pr-4 text-xs font-medium text-white/40">Artista</th>
                  <th className="pb-3 pr-4 text-xs font-medium text-white/40">Álbum</th>
                  <th className="pb-3 pr-4 text-xs font-medium text-white/40">Plays</th>
                  <th className="pb-3 pr-4 text-xs font-medium text-white/40">Status</th>
                  <th className="pb-3 text-xs font-medium text-white/40">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(songs ?? []).map((song) => {
                  const s = song as {
                    id: string; title: string; play_count: number; is_active: boolean;
                    artists: { name: string } | null; albums: { title: string } | null;
                  };
                  return (
                    <tr key={s.id} className="hover:bg-white/3">
                      <td className="py-3 pr-4 font-medium text-white">{s.title}</td>
                      <td className="py-3 pr-4 text-white/60">{s.artists?.name ?? "—"}</td>
                      <td className="py-3 pr-4 text-white/40">{s.albums?.title ?? "—"}</td>
                      <td className="py-3 pr-4 text-white/40 tabular-nums">{s.play_count}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={s.is_active ? "success" : "secondary"}>
                          {s.is_active ? "Ativa" : "Inativa"}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          <Link href={`/admin/songs/${s.id}/edit`}>
                            <Button size="icon" variant="ghost">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <Button size="icon" variant="danger">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
              <p className="text-xs text-white/40">
                {count} músicas · Página {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link href={`?page=${page - 1}${query ? `&q=${query}` : ""}`}>
                    <Button variant="outline" size="sm">← Anterior</Button>
                  </Link>
                )}
                {page < totalPages && (
                  <Link href={`?page=${page + 1}${query ? `&q=${query}` : ""}`}>
                    <Button variant="outline" size="sm">Próxima →</Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
