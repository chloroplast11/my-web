export type Track = {
  title: string;
  artist: string;
  src: string;
};

// Files in /public/music. Browsers handle non-ASCII paths inconsistently, so
// we keep the literal path here (readable) and the player URL-encodes at the
// <audio src> use site.
export const PLAYLIST: readonly Track[] = [
  { title: "Flying Birds",        artist: "—",            src: "/music/flying_birds.mp3" },
  { title: "Free Spirit Rock",    artist: "Geoff Harvey", src: "/music/geoffharvey-free-spirit-rock-377127.mp3" },
  { title: "おひるのそよかぜ",     artist: "—",            src: "/music/おひるのそよかぜ.mp3" },
  { title: "日曜日の朝",           artist: "—",            src: "/music/日曜日の朝.mp3" },
] as const;

export function pickRandomIndex(rng: () => number = Math.random): number {
  const idx = Math.floor(rng() * PLAYLIST.length);
  return Math.min(Math.max(idx, 0), PLAYLIST.length - 1);
}
