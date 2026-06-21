"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { PLAYLIST, type Track } from "./music-playlist";

type MusicPlayerContextValue = {
  track: Track;
  index: number;
  playing: boolean;
  currentTime: number;
  duration: number;
  hasStarted: boolean;
  togglePlay: () => void;
  prev: () => void;
  next: () => void;
  seek: (ratio: number) => void;
};

const Ctx = createContext<MusicPlayerContextValue | null>(null);

export function useMusicPlayer(): MusicPlayerContextValue {
  const v = useContext(Ctx);
  if (!v) {
    throw new Error("useMusicPlayer must be used inside <MusicPlayerProvider>");
  }
  return v;
}

export function MusicPlayerProvider({
  initialIndex,
  children,
}: {
  initialIndex: number;
  children: React.ReactNode;
}) {
  const [index, setIndexState] = useState(() =>
    Math.min(Math.max(initialIndex, 0), PLAYLIST.length - 1),
  );
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const track = PLAYLIST[index];

  // Reload audio when track changes; progress is reset by the handlers, not here.
  useEffect(() => {
    audioRef.current?.load();
  }, [index]);

  // Play/pause follows the flag. play() may reject (autoplay block, missing
  // gesture); jsdom returns undefined so Promise.resolve normalizes both.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      void Promise.resolve(audio.play()).catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [playing, index]);

  const togglePlay = useCallback(() => {
    setPlaying((p) => {
      const next = !p;
      if (next) setHasStarted(true);
      return next;
    });
  }, []);

  const prev = useCallback(() => {
    setIndexState((i) => (i - 1 + PLAYLIST.length) % PLAYLIST.length);
    setPlaying(true);
    setCurrentTime(0);
    setDuration(0);
    setHasStarted(true);
  }, []);

  const next = useCallback(() => {
    setIndexState((i) => (i + 1) % PLAYLIST.length);
    setPlaying(true);
    setCurrentTime(0);
    setDuration(0);
    setHasStarted(true);
  }, []);

  const seek = useCallback(
    (ratio: number) => {
      const audio = audioRef.current;
      if (!audio || !duration || !isFinite(duration)) return;
      const r = Math.max(0, Math.min(1, ratio));
      audio.currentTime = r * duration;
      setCurrentTime(audio.currentTime);
    },
    [duration],
  );

  return (
    <Ctx.Provider
      value={{
        track,
        index,
        playing,
        currentTime,
        duration,
        hasStarted,
        togglePlay,
        prev,
        next,
        seek,
      }}
    >
      <audio
        ref={audioRef}
        src={encodeURI(track.src)}
        preload="metadata"
        onEnded={next}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
      {children}
    </Ctx.Provider>
  );
}
