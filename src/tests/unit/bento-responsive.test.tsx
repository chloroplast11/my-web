// src/tests/unit/bento-responsive.test.tsx
// Structural tests for mobile responsive classes. jsdom cannot evaluate media
// queries, so we assert the responsive class strings are present in the DOM
// (the wiring) rather than computed CSS values.
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BentoStage } from "@/components/home/bento/BentoStage";
import { TitleBlock } from "@/components/home/bento/TitleBlock";
import { PostmarkLayer } from "@/components/home/bento/PostmarkLayer";
import { AboutCard } from "@/components/home/bento/cards/AboutCard";
import { PhotosCard } from "@/components/home/bento/cards/PhotosCard";
import { CalendarCard } from "@/components/home/bento/cards/CalendarCard";
import { MusicCard } from "@/components/home/bento/cards/MusicCard";
import { BlogCard } from "@/components/home/bento/cards/BlogCard";
import { HanabiCard } from "@/components/home/bento/cards/HanabiCard";
import { GithubBadge } from "@/components/home/bento/cards/GithubBadge";

const TODAY = new Date("2026-06-17T00:00:00Z");
const TRACK = { title: "Test Song", artist: "Test Artist" };
const BLOG_POST = { title: "Test Post", publishedAt: TODAY };
const PHOTO = { src: "https://example.com/photo.jpg", alt: "test" };

describe("BentoStage responsive layout", () => {
  it("inner wrapper has grid grid-cols-2 gap-3 for mobile and md:block with responsive heights", () => {
    const { container } = render(<BentoStage><span>x</span></BentoStage>);
    const inner = container.firstChild?.firstChild as HTMLElement;
    expect(inner.className).toMatch(/grid/);
    expect(inner.className).toMatch(/grid-cols-2/);
    expect(inner.className).toMatch(/gap-3/);
    expect(inner.className).toMatch(/md:block/);
    // Inner reference height grows with breakpoints (proportional to BENTO_REF_W/H).
    expect(inner.className).toMatch(/md:h-\[600px\]/);
    expect(inner.className).toMatch(/xl:h-\[750px\]/);
    expect(inner.className).toMatch(/2xl:h-\[890px\]/);
  });
});

describe("TitleBlock responsive classes", () => {
  it("has mobile font size text-[36px] and desktop md:text-[60px]", () => {
    const { container } = render(<TitleBlock />);
    const h1 = container.querySelector("h1") as HTMLElement;
    expect(h1.className).toMatch(/text-\[36px\]/);
    expect(h1.className).toMatch(/md:text-\[60px\]/);
  });

  it("has md:absolute md:left-5 md:top-7 for desktop positioning", () => {
    const { container } = render(<TitleBlock />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toMatch(/md:absolute/);
    expect(wrapper.className).toMatch(/md:left-5/);
    expect(wrapper.className).toMatch(/md:top-7/);
  });

  it("has col-span-2 so it spans full width in the mobile grid", () => {
    const { container } = render(<TitleBlock />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toMatch(/col-span-2/);
  });
});

describe("PostmarkLayer responsive classes", () => {
  it("outer wrapper has mobile flex layout and md:absolute inset-0 for desktop", () => {
    const { container } = render(<PostmarkLayer today={TODAY} />);
    const outer = container.firstChild as HTMLElement;
    expect(outer.className).toMatch(/flex/);
    expect(outer.className).toMatch(/justify-center/);
    expect(outer.className).toMatch(/md:absolute/);
    expect(outer.className).toMatch(/md:inset-0/);
    expect(outer.className).toMatch(/md:block/);
  });

  it("date stamp has hidden class (hidden on mobile) and md:block for desktop", () => {
    const { container } = render(<PostmarkLayer today={TODAY} />);
    // Find the date stamp div — it's the direct child with hidden class (not the outer wrapper)
    const dateDivs = Array.from(container.querySelectorAll("div")).filter(
      (el) => el.className.includes("hidden") && el.textContent?.match(/2026\.06\.17/)
    );
    expect(dateDivs.length).toBeGreaterThan(0);
    const dateDiv = dateDivs[0];
    expect(dateDiv.className).toMatch(/hidden/);
    expect(dateDiv.className).toMatch(/md:block/);
  });

  it("each postmark stamp has max-md:!static and max-md:!w-14 mobile overrides", () => {
    const { container } = render(<PostmarkLayer today={TODAY} />);
    // The stamp divs are direct children of the outer div (excluding the date stamp)
    const stamps = Array.from(container.querySelectorAll("div")).filter(
      (el) => el.className.includes("max-md:!static") && el.className.includes("rounded-full")
    );
    expect(stamps.length).toBe(3);
    stamps.forEach((stamp) => {
      expect(stamp.className).toMatch(/max-md:!static/);
      expect(stamp.className).toMatch(/max-md:!w-14/);
      expect(stamp.className).toMatch(/max-md:!h-14/);
    });
  });
});

describe("AboutCard responsive classes", () => {
  it("has max-md:col-span-2 to span full width in mobile grid", () => {
    const { container } = render(<AboutCard enterIndex={0} />);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toMatch(/max-md:col-span-2/);
  });

  it("has max-md:!static max-md:!w-full max-md:!h-auto to override inline geometry", () => {
    const { container } = render(<AboutCard enterIndex={0} />);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toMatch(/max-md:!static/);
    expect(root.className).toMatch(/max-md:!w-full/);
    expect(root.className).toMatch(/max-md:!h-auto/);
    expect(root.className).toMatch(/max-md:!left-auto/);
    expect(root.className).toMatch(/max-md:!top-auto/);
  });
});

describe("PhotosCard responsive classes", () => {
  it("has max-md:col-span-2 to span full width in mobile grid", () => {
    const { container } = render(<PhotosCard photo={PHOTO} enterIndex={3} />);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toMatch(/max-md:col-span-2/);
  });

  it("has max-md:!static max-md:!w-full max-md:!h-auto to override inline geometry", () => {
    const { container } = render(<PhotosCard photo={PHOTO} enterIndex={3} />);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toMatch(/max-md:!static/);
    expect(root.className).toMatch(/max-md:!w-full/);
    expect(root.className).toMatch(/max-md:!h-auto/);
  });
});

describe("Single-column card responsive classes (CalendarCard, MusicCard, BlogCard, HanabiCard, GithubBadge)", () => {
  const mobileOverrideClasses = [
    "max-md:!static",
    "max-md:!left-auto",
    "max-md:!top-auto",
    "max-md:!w-full",
    "max-md:!h-auto",
  ];

  function assertMobileOverrides(element: HTMLElement) {
    mobileOverrideClasses.forEach((cls) => {
      expect(element.className).toMatch(new RegExp(cls.replace(/[[\]!]/g, "\\$&")));
    });
    // Should NOT have col-span-2
    expect(element.className).not.toMatch(/max-md:col-span-2/);
  }

  it("CalendarCard has single-col mobile overrides (no col-span-2)", () => {
    const { container } = render(<CalendarCard today={TODAY} enterIndex={1} />);
    assertMobileOverrides(container.firstChild as HTMLElement);
  });

  it("MusicCard has single-col mobile overrides", () => {
    const { container } = render(<MusicCard track={TRACK} enterIndex={2} />);
    assertMobileOverrides(container.firstChild as HTMLElement);
  });

  it("BlogCard has single-col mobile overrides", () => {
    const { container } = render(<BlogCard post={BLOG_POST} enterIndex={4} />);
    assertMobileOverrides(container.firstChild as HTMLElement);
  });

  it("HanabiCard has single-col mobile overrides", () => {
    const { container } = render(<HanabiCard enterIndex={5} />);
    assertMobileOverrides(container.firstChild as HTMLElement);
  });

  it("GithubBadge has single-col mobile overrides", () => {
    const { container } = render(<GithubBadge href="https://github.com/test" enterIndex={6} />);
    assertMobileOverrides(container.firstChild as HTMLElement);
  });
});
