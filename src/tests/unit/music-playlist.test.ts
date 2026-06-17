import { describe, it, expect } from "vitest";
import { PLAYLIST, pickRandomTrack, type Track } from "@/lib/music-playlist";

describe("music-playlist", () => {
  it("exposes a non-empty array of tracks with title + artist", () => {
    expect(PLAYLIST.length).toBeGreaterThan(0);
    for (const t of PLAYLIST) {
      expect(t.title.length).toBeGreaterThan(0);
      expect(t.artist.length).toBeGreaterThan(0);
    }
  });

  it("pickRandomTrack returns a track from the playlist", () => {
    const t = pickRandomTrack(() => 0);
    expect(PLAYLIST).toContainEqual(t);
  });

  it("pickRandomTrack uses the injected RNG to index", () => {
    const t0: Track = pickRandomTrack(() => 0);
    const tLast: Track = pickRandomTrack(() => 0.9999);
    expect(t0).toEqual(PLAYLIST[0]);
    expect(tLast).toEqual(PLAYLIST[PLAYLIST.length - 1]);
  });
});
