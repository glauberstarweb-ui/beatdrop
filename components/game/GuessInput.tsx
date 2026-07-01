"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Search, SkipForward } from "lucide-react";
import type { SearchResult } from "@/types/game";
import Image from "next/image";

interface GuessInputProps {
  onGuess: (text: string, songId: string | null) => void;
  onSkip: () => void;
  disabled?: boolean;
}

export function GuessInput({ onGuess, onSkip, disabled }: GuessInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || selected) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/songs/search?q=${encodeURIComponent(query)}&limit=8`);
      const data: SearchResult[] = res.ok ? await res.json() : [];
      setResults(data);
      setShowDropdown(data.length > 0);
    }, 200);
  }, [query, selected]);

  const handleSelect = (result: SearchResult) => {
    setSelected(result);
    setQuery(`${result.title} — ${result.artist_name}`);
    setShowDropdown(false);
  };

  const handleSubmit = () => {
    if (disabled) return;
    const guessText = selected
      ? `${selected.title} — ${selected.artist_name}`
      : query;
    if (!guessText.trim()) return;

    onGuess(guessText, selected?.id ?? null);
    setQuery("");
    setSelected(null);
    setResults([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="w-full space-y-3">
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length > 0 && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            placeholder="Buscar música ou artista…"
            disabled={disabled}
            className={cn(
              "w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-white",
              "placeholder:text-white/30 outline-none transition-all duration-200",
              "focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
        </div>

        {showDropdown && (
          <div className="absolute top-full mt-1 w-full z-50 rounded-xl border border-white/10 bg-surface-800 shadow-2xl overflow-hidden">
            {results.map((result) => (
              <button
                key={result.id}
                className="flex w-full items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                onMouseDown={() => handleSelect(result)}
              >
                {result.album_cover ? (
                  <Image
                    src={result.album_cover}
                    alt={result.title}
                    width={36}
                    height={36}
                    className="rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-surface-600 shrink-0 flex items-center justify-center">
                    <span className="text-xs">🎵</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {result.title}
                  </p>
                  <p className="text-xs text-white/50 truncate">
                    {result.artist_name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          className="flex-1"
          onClick={handleSubmit}
          disabled={disabled || !query.trim()}
        >
          Adivinhar
        </Button>
        <Button variant="outline" onClick={onSkip} disabled={disabled}>
          <SkipForward className="h-4 w-4" />
          Pular
        </Button>
      </div>
    </div>
  );
}
