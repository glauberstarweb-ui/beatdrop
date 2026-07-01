"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Music2 } from "lucide-react";
import Link from "next/link";

type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
    const body = mode === "register"
      ? { email, username, password }
      : { email, password };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Algo deu errado.");
      return;
    }

    router.push("/daily");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-brand-600/20 blur-[120px]" />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-brand shadow-lg shadow-brand-500/40">
              <Music2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-black text-gradient">BeatDrop</span>
          </Link>
          <p className="text-white/40 text-sm">
            {mode === "login"
              ? "Entre para salvar seu progresso e competir no ranking"
              : "Crie sua conta gratuitamente"}
          </p>
        </div>

        <Card glass glow>
          <CardContent className="py-6 flex flex-col gap-4">
            {/* Tabs */}
            <div className="flex rounded-xl bg-white/5 p-1">
              {(["login", "register"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(""); }}
                  className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                    mode === m
                      ? "bg-brand-500 text-white shadow"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  {m === "login" ? "Entrar" : "Criar conta"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20"
              />

              {mode === "register" && (
                <input
                  type="text"
                  placeholder="Nome de usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={2}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20"
                />
              )}

              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20"
              />

              {error && (
                <p className="text-sm text-red-400 text-center">{error}</p>
              )}

              <Button type="submit" disabled={loading} className="w-full mt-1">
                {loading
                  ? "Aguarde…"
                  : mode === "login"
                  ? "Entrar"
                  : "Criar conta"}
              </Button>
            </form>
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
