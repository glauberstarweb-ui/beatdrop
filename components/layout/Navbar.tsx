"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/useUser";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import {
  Music2,
  Calendar,
  Infinity,
  Users,
  Trophy,
  UserCircle,
  LogOut,
  Settings,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const navLinks = [
  { href: "/daily", label: "Diário", icon: Calendar },
  { href: "/infinite", label: "Infinito", icon: Infinity },
  { href: "/multiplayer", label: "Multi", icon: Users },
  { href: "/leaderboard", label: "Ranking", icon: Trophy },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, profile } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-surface-900/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-brand">
            <Music2 className="h-4 w-4 text-white" />
          </div>
          <span className="bg-gradient-brand bg-clip-text text-transparent">
            BeatDrop
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                pathname === href || pathname.startsWith(href + "/")
                  ? "bg-brand-500/20 text-brand-300"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-xl p-1 pr-3 hover:bg-white/5 transition-all"
              >
                <Avatar
                  src={profile?.avatar_url}
                  fallback={profile?.username ?? user.email ?? "U"}
                  size="sm"
                />
                <span className="hidden sm:block text-sm font-medium text-white/80">
                  {profile?.username ?? "Perfil"}
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-white/10 bg-surface-800 shadow-2xl overflow-hidden animate-slide-up">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                    onClick={() => setMenuOpen(false)}
                  >
                    <UserCircle className="h-4 w-4" />
                    Perfil
                  </Link>
                  {profile?.id && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                      onClick={() => setMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Admin
                    </Link>
                  )}
                  <div className="border-t border-white/10" />
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm">Entrar</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 bg-surface-900/90 backdrop-blur-xl">
        <div className="flex items-center justify-around px-4 py-2">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-xs font-medium transition-all",
                pathname === href
                  ? "text-brand-300"
                  : "text-white/40 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
          {user ? (
            <Link
              href="/profile"
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-xs font-medium transition-all",
                pathname === "/profile" ? "text-brand-300" : "text-white/40"
              )}
            >
              <UserCircle className="h-5 w-5" />
              Perfil
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex flex-col items-center gap-0.5 text-xs font-medium text-white/40"
            >
              <UserCircle className="h-5 w-5" />
              Entrar
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
