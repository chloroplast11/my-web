import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BlogCard } from "@/components/home/bento/cards/BlogCard";

describe("BlogCard", () => {
  it("links to /blog", () => {
    const { container } = render(<BlogCard post={null} enterIndex={4} />);
    const link = container.querySelector("a") as HTMLAnchorElement;
    expect(link).toHaveAttribute("href", "/blog");
  });

  it("renders the masthead 'The Quiet Times' and 'from the journal' byline", () => {
    render(
      <BlogCard
        post={{
          title: "Hello World",
          excerpt: "A short summary of the post.",
          publishedAt: new Date("2026-05-01"),
        }}
        enterIndex={4}
      />,
    );
    expect(screen.getByText(/the quiet times/i)).toBeInTheDocument();
    expect(screen.getByText(/from the journal/i)).toBeInTheDocument();
  });

  it("shows the latest post title and excerpt when provided", () => {
    render(
      <BlogCard
        post={{
          title: "Hello World",
          excerpt: "A short summary of the post.",
          publishedAt: new Date("2026-05-01"),
        }}
        enterIndex={4}
      />,
    );
    expect(screen.getByText("Hello World")).toBeInTheDocument();
    expect(screen.getByText(/short summary/i)).toBeInTheDocument();
  });

  it("shows a placeholder when there are no posts", () => {
    render(<BlogCard post={null} enterIndex={4} />);
    expect(screen.getByText(/no posts yet/i)).toBeInTheDocument();
  });
});
