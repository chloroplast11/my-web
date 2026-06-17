import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PhotosCard } from "@/components/home/bento/cards/PhotosCard";

describe("PhotosCard", () => {
  it("renders an internal link to /photos with label", () => {
    render(<PhotosCard photo={null} enterIndex={3} />);
    const link = screen.getByRole("link", { name: /photos/i });
    expect(link).toHaveAttribute("href", "/photos");
  });

  it("renders the preview image when provided", () => {
    render(
      <PhotosCard
        photo={{ src: "https://example.com/p.jpg", alt: "preview" }}
        enterIndex={3}
      />,
    );
    const img = screen.getByAltText("preview") as HTMLImageElement;
    expect(img.src).toBe("https://example.com/p.jpg");
  });

  it("shows the photos label even when image is missing", () => {
    render(<PhotosCard photo={null} enterIndex={3} />);
    expect(screen.getByText(/photos/i)).toBeInTheDocument();
  });
});
