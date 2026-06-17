export type Track = {
  title: string;
  artist: string;
  album?: string;
};

export const PLAYLIST: readonly Track[] = [
  { title: "Last Summer Whisper", artist: "Anri", album: "Timely!!" },
  { title: "Plastic Love", artist: "Mariya Takeuchi" },
  { title: "September", artist: "Earth, Wind & Fire" },
] as const;

export function pickRandomTrack(rng: () => number = Math.random): Track {
  const idx = Math.floor(rng() * PLAYLIST.length);
  return PLAYLIST[Math.min(idx, PLAYLIST.length - 1)];
}
