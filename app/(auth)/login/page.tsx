"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Music2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  const handleOAuth = async (provider: "google" | "discord") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-brand-600/20 blur-[120px]" />
      </div>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-brand shadow-lg shadow-brand-500/40">
              <Music2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-black text-gradient">BeatDrop</span>
          </Link>
          <p className="text-white/40 text-sm">
            Entre para salvar seu progresso e competir no ranking
          </p>
        </div>

        <Card glass glow>
          <CardContent className="py-6 flex flex-col gap-4">
            {sent ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">📬</div>
                <p className="font-semibold text-white mb-1">
                  Verifique seu email
                </p>
                <p className="text-sm text-white/50">
                  Enviamos um link mágico para <strong>{email}</strong>.
                  Clique no link para entrar.
                </p>
              </div>
            ) : (
              <>
                {/* OAuth */}
                <Button
                  variant="outline"
                  onClick={() => handleOAuth("google")}
                  className="w-full"
                >
                  <Image
                    src="https://www.google.com/favicon.ico"
                    alt="Google"
                    width={16}
                    height={16}
                  />
                  Continuar com Google
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleOAuth("discord")}
                  className="w-full"
                >
                  <span className="text-indigo-400 font-bold text-lg leading-none">
                    𝐃
                  </span>
                  Continuar com Discord
                </Button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-white/30">ou email</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Magic link */}
                <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    error={error}
                  />
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Enviando…" : "Entrar com link mágico"}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-white/30">
          Ao entrar você concorda com os nossos{" "}
          <span className="text-white/50 underline cursor-pointer">termos</span>.
        </p>
      </div>
    </div>
  );
}
