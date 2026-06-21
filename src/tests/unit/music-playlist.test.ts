import { describe, it, expect } from "vitest";
import { PLAYLIST, pickRandomIndex } from "@/lib/music-playlist";

describe("music-playlist", () => {
  it("exposes a non-empty array of tracks with title + artist + src", () => {
    expect(PLAYLIST.length).toBeGreaterThan(0);
    for (const t of PLAYLIST) {
      expect(t.title.length).toBeGreaterThan(0);
      expect(t.artist.length).toBeGreaterThan(0);
      expect(t.src.startsWith("/music/")).toBe(true);
    }
  });

  it("pickRandomIndex returns a valid playlist index", () => {
    const idx = pickRandomIndex(() => 0);
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThan(PLAYLIST.length);
  });

  it("pickRandomIndex uses the injected RNG to pick boundaries", () => {
    expect(pickRandomIndex(() => 0)).toBe(0);
    expect(pickRandomIndex(() => 0.9999)).toBe(PLAYLIST.length - 1);
  });
});
