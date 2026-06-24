import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PostMetaForm } from "@/components/admin/PostMetaForm";

const initial = {
  title: "Hello",
  slug: "hello",
  language: "en" as const,
  excerpt: "",
  coverImageUrl: "",
  contentJson: undefined,
  tagIds: [],
};

describe("PostMetaForm layout", () => {
  it("renders title and slug inputs in the left pane (data-pane='left')", () => {
    const { container } = render(
      <PostMetaForm initial={initial} allTags={[]} onSubmit={async () => {}} submitLabel="Save" />,
    );
    const left = container.querySelector('[data-pane="left"]');
    expect(left).not.toBeNull();
    expect(left?.querySelector('input[name="title"]')).not.toBeNull();
    expect(left?.querySelector('input[name="slug"]')).not.toBeNull();
  });

  it("renders excerpt, tags, cover, language, and submit in the right pane (data-pane='right')", () => {
    const { container } = render(
      <PostMetaForm initial={initial} allTags={[]} onSubmit={async () => {}} submitLabel="Save" />,
    );
    const right = container.querySelector('[data-pane="right"]');
    expect(right).not.toBeNull();
    expect(right?.querySelector('textarea[name="excerpt"]')).not.toBeNull();
    expect(right?.querySelector('input[name="coverImageUrl"]')).not.toBeNull();
    expect(right?.querySelector('select[name="language"]')).not.toBeNull();
    expect(right?.querySelector('button[type="submit"]')).not.toBeNull();
  });

  it("renders the submit button with the provided label", () => {
    render(
      <PostMetaForm initial={initial} allTags={[]} onSubmit={async () => {}} submitLabel="Create draft" />,
    );
    expect(screen.getByRole("button", { name: /create draft/i })).toBeInTheDocument();
  });
});
