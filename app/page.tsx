import Link from "next/link";
import { Calendar, Infinity as InfinityIcon, Users, Zap, Headphones, Search, ChevronRight, Trophy, Music2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="pt-20 pb-16 md:pt-28 md:pb-20 text-center relative overflow-hidden px-4">
        {/* Nav */}
        <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-bold text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-brand">
              <Music2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-gradient">BeatDrop</span>
          </div>
          <Link href="/login">
            <Button size="sm" variant="outline">Entrar</Button>
          </Link>
        </nav>

        {/* SVG waveform decoration */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <svg width="600" height="120" viewBox="0 0 600 120" xmlns="http://www.w3.org/2000/svg" className="opacity-[0.12]">
            {[18,32,24,44,30,50,22,48,26,54,20,46,28,52,18,42,24,50,30,44,20,38,26,48,22,42,18,36,24,46,30].map((h, i) => (
              <rect
                key={i}
                x={i * 20 + 5}
                y={(120 - h) / 2}
                width="10"
                height={h}
                rx="4"
                className="fill-brand-400"
              />
            ))}
          </svg>
        </div>

        {/* Badge */}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-xs text-brand-300 font-medium mb-6">
          🎵 Novo jogo todo dia
        </span>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          Adivinhe a <span className="text-brand-400">música</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base text-white/50 mb-8">
          4 tentativas. 30 segundos. Você descobre?
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/daily"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-400 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 active:scale-[0.97]"
          >
            <Calendar className="h-4 w-4" />
            Jogar agora
          </Link>
          <Link
            href="/infinite"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-6 py-3 text-sm font-medium text-white/80 hover:text-white transition-all duration-200"
          >
            <InfinityIcon className="h-4 w-4" />
            Modo infinito
          </Link>
        </div>

        {/* Stats */}
        <p className="text-xs text-white/30 text-center mt-4">
          1.700+ músicas · 4 tentativas · Modo infinito
        </p>
      </section>

      {/* Animated equalizer separator */}
      <div className="flex items-end justify-center gap-1 h-6 mb-10 opacity-20" aria-hidden="true">
        {[4,7,5,9,6,8,4,7,5,6,8,5].map((h, i) => (
          <div
            key={i}
            style={{ height: `${h * 2}px`, animationDelay: `${i * 0.1}s` }}
            className="w-1 rounded-full bg-brand-400 animate-[waveform_1.2s_ease-in-out_infinite]"
          />
        ))}
      </div>

      {/* Mode Cards */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-white">Escolha seu modo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Diário */}
            <div className="rounded-2xl border border-blue-500/20 bg-surface-800 p-5 hover:-translate-y-0.5 hover:border-blue-500/40 transition-all duration-200 group">
              <div className="mb-3 inline-flex bg-blue-500/15 rounded-xl p-2.5">
                <Calendar className="h-5 w-5 text-blue-400" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-white">Jogo Diário</h3>
                <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-medium text-blue-400">Novo hoje</span>
              </div>
              <p className="text-sm text-white/50 mb-3 leading-relaxed">Uma nova música todo dia. Todos jogam a mesma.</p>
              <Link href="/daily" className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
                Jogar agora →
              </Link>
            </div>

            {/* Infinito */}
            <div className="rounded-2xl border border-purple-500/20 bg-surface-800 p-5 hover:-translate-y-0.5 hover:border-purple-500/40 transition-all duration-200 group">
              <div className="mb-3 inline-flex bg-purple-500/15 rounded-xl p-2.5">
                <InfinityIcon className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="font-bold text-white mb-1">Modo Infinito</h3>
              <p className="text-sm text-white/50 mb-3 leading-relaxed">Quantas músicas quiser, sem parar. Por categoria.</p>
              <Link href="/infinite" className="text-purple-400 text-sm hover:text-purple-300 transition-colors">
                Começar →
              </Link>
            </div>

            {/* Multiplayer */}
            <div className="rounded-2xl border border-white/10 bg-surface-800 p-5 transition-all duration-200 group">
              <div className="mb-3 inline-flex bg-white/8 rounded-xl p-2.5">
                <Users className="h-5 w-5 text-white/30" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-white/40">Multijogador</h3>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/30">Em breve</span>
              </div>
              <p className="text-sm text-white/30 mb-3 leading-relaxed">Desafie amigos em tempo real.</p>
              <span className="text-white/25 text-sm">Em breve</span>
            </div>

            {/* Desafio */}
            <div className="rounded-2xl border border-amber-500/20 bg-surface-800 p-5 hover:-translate-y-0.5 hover:border-amber-500/40 transition-all duration-200 group">
              <div className="mb-3 inline-flex bg-amber-500/15 rounded-xl p-2.5">
                <Zap className="h-5 w-5 text-amber-400" />
              </div>
              <h3 className="font-bold text-white mb-1">Desafio</h3>
              <p className="text-sm text-white/50 mb-3 leading-relaxed">Crie um desafio e mande para seus amigos.</p>
              <span className="text-amber-400 text-sm cursor-default">Compartilhar →</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 pb-20 bg-surface-800/40 border-t border-white/5">
        <div className="mx-auto max-w-3xl py-16">
          <h2 className="mb-10 text-center text-2xl font-bold text-white">Como funciona</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {[
              { num: "1", icon: Headphones, title: "Ouça o trecho", desc: "Um pequeno pedaço da música toca" },
              { num: "2", icon: Search, title: "Adivinhe", desc: "Digite o nome da música ou artista" },
              { num: "3", icon: ChevronRight, title: "4 chances", desc: "A cada erro, mais tempo é revelado" },
              { num: "4", icon: Trophy, title: "Pontuação", desc: "Acerte rápido para mais pontos" },
            ].map(({ num, icon: Icon, title, desc }) => (
              <div key={num} className="flex flex-col items-center text-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/15 border border-brand-500/25 text-brand-400 font-bold text-sm">
                  {num}
                </div>
                <Icon className="h-5 w-5 text-white/40" />
                <h3 className="font-semibold text-white text-sm">{title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 text-center bg-surface-800/40 border-t border-white/5">
        <div className="mx-auto max-w-lg">
          <h2 className="text-2xl font-bold text-white mb-3">Pronto para jogar?</h2>
          <p className="text-white/50 mb-8">Descubra quantas músicas você conhece.</p>
          <Link
            href="/daily"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-400 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 active:scale-[0.97]"
          >
            Começar agora
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-sm text-white/20">
        © 2025 BeatDrop · Feito com 🎵
      </footer>
    </div>
  );
}
