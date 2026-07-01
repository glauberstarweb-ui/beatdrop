import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Music2 } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-brand shadow-2xl shadow-brand-500/40">
        <Music2 className="h-10 w-10 text-white" />
      </div>
      <h1 className="text-6xl font-black text-white mb-4">404</h1>
      <p className="text-xl text-white/60 mb-8">
        Essa página não existe — mas a música está tocando!
      </p>
      <Link href="/">
        <Button size="lg">Voltar ao início</Button>
      </Link>
    </div>
  );
}
