"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getRandomSong } from "@/services/songs";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Zap, Copy, Share2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { nanoid } from "nanoid";
import Link from "next/link";

export default function ChallengePage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const songs = await Promise.all(
        Array.from({ length: 5 }, () => getRandomSong([]))
      );
      const songIds = songs.filter(Boolean).map((s) => s!.id);
      if (songIds.length === 0) throw new Error("Sem músicas");

      const code = nanoid(8);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const supabase = createClient();
      const { data, error } = await supabase
        .from("challenges")
        .insert({
          creator_id: user.id,
          song_ids: songIds,
          code,
          expires_at: expiresAt.toISOString(),
        })
        .select("code")
        .single();

      if (error) throw error;
      const url = `${window.location.origin}/challenge/${data.code}`;
      setLink(url);
    } catch {
      toast.error("Erro ao criar desafio");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (link) {
      navigator.clipboard.writeText(link);
      toast.success("Link copiado!");
    }
  };

  const handleShare = async () => {
    if (!link) return;
    if (navigator.share) {
      await navigator.share({
        title: "BeatDrop — Desafio musical",
        text: "Você consegue adivinhar estas músicas?",
        url: link,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          <Zap className="h-5 w-5 text-amber-400" />
          <Badge variant="warning">Desafio</Badge>
        </div>
        <h1 className="text-2xl font-bold text-white">Desafie seus amigos</h1>
        <p className="mt-1 text-sm text-white/40">
          Gere um link com 5 músicas e compartilhe com quem quiser
        </p>
      </div>

      {!user ? (
        <Card glass className="text-center p-8">
          <p className="text-white/50 mb-4">Você precisa estar logado.</p>
          <Link href="/login">
            <Button className="w-full">Entrar</Button>
          </Link>
        </Card>
      ) : !link ? (
        <Card glass glow>
          <CardContent className="py-8 flex flex-col items-center gap-6">
            <div className="text-6xl">⚡</div>
            <div className="text-center">
              <p className="font-semibold text-white mb-1">Como funciona</p>
              <p className="text-sm text-white/50">
                Criamos uma sequência secreta de 5 músicas. Compartilhe o link
                — todos que acessarem vão jogar as mesmas músicas.
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleCreate}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Gerando…" : "Gerar desafio"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card glass glow>
          <CardContent className="py-8 flex flex-col items-center gap-6">
            <div className="text-5xl">🎉</div>
            <div className="text-center">
              <p className="font-semibold text-white mb-1">Desafio criado!</p>
              <p className="text-sm text-white/50">
                Compartilhe o link abaixo com seus amigos
              </p>
            </div>
            <div className="w-full rounded-xl border border-white/10 bg-surface-600 px-4 py-3 font-mono text-xs text-white/70 break-all text-center">
              {link}
            </div>
            <div className="flex gap-3 w-full">
              <Button variant="outline" onClick={handleCopy} className="flex-1">
                <Copy className="h-4 w-4" />
                Copiar
              </Button>
              <Button onClick={handleShare} className="flex-1">
                <Share2 className="h-4 w-4" />
                Compartilhar
              </Button>
            </div>
            <Button
              variant="ghost"
              onClick={() => setLink(null)}
              className="text-white/40"
            >
              Criar novo desafio
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
