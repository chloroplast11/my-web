import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BlogCard } from "@/components/home/bento/cards/BlogCard";

describe("BlogCard", () => {
  it("links to /blog", () => {
    render(<BlogCard post={null} enterIndex={4} />);
    const link = screen.getByRole("link", { name: /blog/i });
    expect(link).toHaveAttribute("href", "/blog");
  });

  it("shows the latest post title when provided", () => {
    render(
      <BlogCard
        post={{ title: "Hello World", publishedAt: new Date("2026-05-01") }}
        enterIndex={4}
      />,
    );
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("shows a placeholder when there are no posts", () => {
    render(<BlogCard post={null} enterIndex={4} />);
    expect(screen.getByText(/blog/i)).toBeInTheDocument();
  });
});
