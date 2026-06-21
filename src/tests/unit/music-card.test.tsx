import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MusicCard } from "@/components/home/bento/cards/MusicCard";
import { PLAYLIST } from "@/lib/music-playlist";

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

describe("MusicCard", () => {
  it("renders the initial track title with a ♪ glyph", () => {
    render(<MusicCard initialIndex={0} enterIndex={2} />);
    expect(
      screen.getByText(new RegExp(escapeRegex(PLAYLIST[0].title))),
    ).toBeInTheDocument();
    expect(screen.getByText(/♪/)).toBeInTheDocument();
  });

  it("exposes prev / play / next controls with aria labels", () => {
    render(<MusicCard initialIndex={0} enterIndex={2} />);
    expect(screen.getByLabelText(/previous track/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^play$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/next track/i)).toBeInTheDocument();
  });

  it("clicking next advances to the next track in the playlist", () => {
    render(<MusicCard initialIndex={0} enterIndex={2} />);
    fireEvent.click(screen.getByLabelText(/next track/i));
    expect(
      screen.getByText(new RegExp(escapeRegex(PLAYLIST[1].title))),
    ).toBeInTheDocument();
  });

  it("clicking prev wraps to the last track from index 0", () => {
    render(<MusicCard initialIndex={0} enterIndex={2} />);
    fireEvent.click(screen.getByLabelText(/previous track/i));
    expect(
      screen.getByText(
        new RegExp(escapeRegex(PLAYLIST[PLAYLIST.length - 1].title)),
      ),
    ).toBeInTheDocument();
  });
});
