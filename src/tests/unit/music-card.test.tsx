import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MusicCard } from "@/components/home/bento/cards/MusicCard";
import { MusicPlayerProvider } from "@/lib/music-player-context";
import { PLAYLIST } from "@/lib/music-playlist";

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function renderCard(initialIndex = 0) {
  return render(
    <MusicPlayerProvider initialIndex={initialIndex}>
      <MusicCard enterIndex={2} />
    </MusicPlayerProvider>,
  );
}

describe("MusicCard", () => {
  it("renders the initial track title with a ♪ glyph", () => {
    renderCard(0);
    expect(
      screen.getByText(new RegExp(escapeRegex(PLAYLIST[0].title))),
    ).toBeInTheDocument();
    expect(screen.getByText(/♪/)).toBeInTheDocument();
  });

  it("exposes prev / play / next controls with aria labels", () => {
    renderCard(0);
    expect(screen.getByLabelText(/previous track/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^play$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/next track/i)).toBeInTheDocument();
  });

  it("clicking next advances to the next track in the playlist", () => {
    renderCard(0);
    fireEvent.click(screen.getByLabelText(/next track/i));
    expect(
      screen.getByText(new RegExp(escapeRegex(PLAYLIST[1].title))),
    ).toBeInTheDocument();
  });

  it("clicking prev wraps to the last track from index 0", () => {
    renderCard(0);
    fireEvent.click(screen.getByLabelText(/previous track/i));
    expect(
      screen.getByText(
        new RegExp(escapeRegex(PLAYLIST[PLAYLIST.length - 1].title)),
      ),
    ).toBeInTheDocument();
  });
});
