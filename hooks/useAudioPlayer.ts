"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export function useAudioPlayer(audioUrl: string, startAt = 0) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopAtRef = useRef<number | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(audioUrl);
    audioRef.current.preload = "auto";
    audioRef.current.addEventListener("loadedmetadata", () => {
      setDuration(audioRef.current?.duration ?? 0);
    });
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [audioUrl]);

  const play = useCallback(
    (seconds: number) => {
      const audio = audioRef.current;
      if (!audio) return;

      audio.currentTime = startAt;
      stopAtRef.current = startAt + seconds;

      audio.play().catch(() => {});
      setIsPlaying(true);

      intervalRef.current = setInterval(() => {
        if (!audio) return;
        const currentTime = audio.currentTime;
        setProgress(((currentTime - startAt) / seconds) * 100);

        if (stopAtRef.current && currentTime >= stopAtRef.current) {
          audio.pause();
          setIsPlaying(false);
          setProgress(0);
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      }, 50);
    },
    [startAt]
  );

  const stop = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  return { isPlaying, progress, duration, play, stop, audioRef };
}
