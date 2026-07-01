"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export function useAudioPlayer(audioUrl: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationRef = useRef<number>(0);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  // Load audio
  useEffect(() => {
    const audio = new Audio(audioUrl);
    audio.preload = "auto";
    audioRef.current = audio;
    return () => {
      clearTimers();
      audio.pause();
      audioRef.current = null;
    };
  }, [audioUrl, clearTimers]);

  const stop = useCallback(() => {
    clearTimers();
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);
    setProgress(0);
  }, [clearTimers]);

  const play = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    // Always restart from beginning
    clearTimers();
    audio.pause();
    audio.currentTime = 0;
    durationRef.current = seconds;

    audio.play().catch(() => {});
    setIsPlaying(true);
    setProgress(0);

    // Progress ticker
    intervalRef.current = setInterval(() => {
      const current = audioRef.current?.currentTime ?? 0;
      setProgress(Math.min((current / seconds) * 100, 100));
    }, 50);

    // Stop exactly after `seconds`
    timerRef.current = setTimeout(() => {
      clearTimers();
      const a = audioRef.current;
      if (a) { a.pause(); a.currentTime = 0; }
      setIsPlaying(false);
      setProgress(0);
    }, seconds * 1000);
  }, [clearTimers]);

  return { isPlaying, progress, play, stop };
}
