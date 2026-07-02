"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Calendar, Infinity, Users, Trophy, UserCircle, LogOut,
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
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((data) => {
      setUsername(data?.username ?? null);
    }).catch(() => {});
  }, []);

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
    await fetch("/api/auth/logout", { method: "POST" });
    setUsername(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-surface-900/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-400">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
            </svg>
          </div>
          <span className="font-bold text-base tracking-tight">
            <span className="text-white">Beat</span><span className="text-brand-400">Drop</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm transition-all",
                  isActive
                    ? "bg-white/8 text-white font-medium"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-brand-400 rounded-full" />
                )}
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {username ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-white/5 transition-all"
              >
                <UserCircle className="h-5 w-5 text-brand-400" />
                <span className="hidden sm:block text-sm font-medium text-white/80">{username}</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-white/10 bg-surface-800 shadow-2xl overflow-hidden">
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
              <button className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 text-white text-sm font-medium px-4 py-2 transition-all duration-200">
                Entrar
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 bg-surface-900/90 backdrop-blur-xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
        <div className="flex items-center justify-around px-4 py-2">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-xs font-medium transition-all",
                pathname === href ? "text-brand-300" : "text-white/40 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
          <Link
            href={username ? "/login" : "/login"}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-xs font-medium transition-all",
              "text-white/40"
            )}
          >
            <UserCircle className="h-5 w-5" />
            {username ?? "Entrar"}
          </Link>
        </div>
      </nav>
    </header>
  );
}
