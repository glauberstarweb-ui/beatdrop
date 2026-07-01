"use client";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Users, Clock } from "lucide-react";
import Link from "next/link";

export default function MultiplayerPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          <Users className="h-5 w-5 text-purple-400" />
          <Badge variant="default">Multijogador</Badge>
        </div>
        <h1 className="text-2xl font-bold text-white">Jogue com amigos</h1>
        <p className="mt-1 text-sm text-white/40">Dispute quem descobre a música primeiro</p>
      </div>

      <Card glass>
        <CardContent className="flex flex-col items-center gap-4 py-16">
          <div className="rounded-full bg-white/5 p-6">
            <Clock className="h-10 w-10 text-white/20" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-white/60">Em breve</p>
            <p className="mt-1 text-sm text-white/30">
              O modo multijogador está sendo desenvolvido.
            </p>
            <p className="mt-0.5 text-sm text-white/30">
              Por enquanto, jogue no{" "}
              <Link href="/infinite" className="text-brand-300 hover:underline">
                Modo Infinito
              </Link>
              !
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
