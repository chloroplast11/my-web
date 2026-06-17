import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MusicCard } from "@/components/home/bento/cards/MusicCard";

describe("MusicCard", () => {
  it("renders the track title and artist", () => {
    render(
      <MusicCard
        track={{ title: "Plastic Love", artist: "Mariya Takeuchi" }}
        enterIndex={2}
      />,
    );
    expect(screen.getByText(/Plastic Love/)).toBeInTheDocument();
    expect(screen.getByText(/Mariya Takeuchi/)).toBeInTheDocument();
  });

  it("includes a musical note glyph prefix", () => {
    render(
      <MusicCard track={{ title: "x", artist: "y" }} enterIndex={2} />,
    );
    expect(screen.getByText(/♪/)).toBeInTheDocument();
  });
});
