import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Music2, Calendar, Infinity, Users, Zap, Trophy, Star, Shield } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Modo Diário",
    description: "Uma nova música todo dia para todos os jogadores. Compare seu resultado com o mundo.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    href: "/daily",
  },
  {
    icon: Infinity,
    title: "Modo Infinito",
    description: "Músicas aleatórias sem fim. Treine seu ouvido e acumule pontos.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    href: "/infinite",
  },
  {
    icon: Users,
    title: "Multiplayer",
    description: "Crie salas e compita com amigos em tempo real. Ranking ao vivo.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    href: "/multiplayer",
  },
  {
    icon: Zap,
    title: "Desafio",
    description: "Gere um link e desafie seus amigos para a mesma sequência de músicas.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    href: "/challenge",
  },
];

const howItWorks = [
  { step: "1", title: "Ouça", desc: "Toque o botão play e ouça apenas 1 segundo da música." },
  { step: "2", title: "Adivinhe", desc: "Digite o nome da música ou artista no campo de busca." },
  { step: "3", title: "Tente novamente", desc: "Cada erro libera mais alguns segundos. Você tem 6 tentativas." },
  { step: "4", title: "Pontue", desc: "Quanto menos tentativas, mais pontos você ganha." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-24 pb-20 text-center overflow-hidden">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-brand-600/20 blur-[120px]" />
          <div className="absolute top-20 right-1/4 h-[300px] w-[300px] rounded-full bg-purple-600/10 blur-[80px]" />
        </div>

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

        <Badge className="mb-6">🎵 Novo jogo todo dia</Badge>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tight mb-6">
          <span className="text-gradient">Adivinhe</span>
          <br />
          <span className="text-white">a música</span>
        </h1>

        <p className="max-w-xl text-lg text-white/60 mb-10">
          Ouça pequenos trechos de músicas e teste seu conhecimento musical.
          Quanto mais rápido adivinhar, mais pontos você ganha.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/daily">
            <Button size="xl" className="rounded-2xl">
              <Calendar className="h-5 w-5" />
              Jogar agora
            </Button>
          </Link>
          <Link href="/infinite">
            <Button size="xl" variant="outline" className="rounded-2xl">
              <Infinity className="h-5 w-5" />
              Modo infinito
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 text-center">
          {[
            { value: "∞", label: "Músicas" },
            { value: "6", label: "Tentativas" },
            { value: "100", label: "Pontos máx." },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-black text-gradient">{value}</p>
              <p className="text-sm text-white/40 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-center text-3xl font-bold text-white">Modos de jogo</h2>
          <p className="mb-10 text-center text-white/40">
            Escolha como quer jogar
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, title, description, color, bg, href }) => (
              <Link key={href} href={href}>
                <div className="group h-full rounded-2xl border border-white/8 bg-surface-700 p-5 hover:border-white/20 hover:bg-surface-600 transition-all duration-300 cursor-pointer">
                  <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <h3 className="font-bold text-white mb-2">{title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 pb-20 bg-surface-800/50">
        <div className="mx-auto max-w-4xl py-16">
          <h2 className="mb-2 text-center text-3xl font-bold text-white">Como jogar</h2>
          <p className="mb-10 text-center text-white/40">Simples assim</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-brand text-white font-black text-xl shadow-lg shadow-brand-500/30">
                  {step}
                </div>
                <h3 className="font-bold text-white">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Extra features */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-3xl py-16 text-center">
          <h2 className="mb-2 text-3xl font-bold text-white">Muito mais que adivinhar</h2>
          <p className="mb-10 text-white/40">Compete, vence, repete</p>
          <div className="grid sm:grid-cols-3 gap-4 text-left">
            {[
              { icon: Trophy, title: "Ranking mundial", desc: "Veja onde você está no ranking global e entre amigos." },
              { icon: Star, title: "Conquistas", desc: "Desbloqueie conquistas ao completar desafios especiais." },
              { icon: Shield, title: "Streak diário", desc: "Mantenha sua sequência jogando todos os dias." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-white/8 bg-surface-700 p-5">
                <Icon className="h-6 w-6 text-brand-400 mb-3" />
                <h3 className="font-bold text-white mb-1">{title}</h3>
                <p className="text-sm text-white/50">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24 text-center">
        <div className="mx-auto max-w-lg">
          <h2 className="text-4xl font-black text-white mb-4">
            Pronto para jogar?
          </h2>
          <p className="text-white/50 mb-8">
            Gratuito, sem anúncios, sem limites.
          </p>
          <Link href="/daily">
            <Button size="xl" className="rounded-2xl w-full sm:w-auto">
              Começar agora →
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-sm text-white/30">
        © 2025 BeatDrop · Feito com 🎵
      </footer>
    </div>
  );
}
