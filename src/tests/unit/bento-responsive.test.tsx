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
import { MusicPlayerProvider } from "@/lib/music-player-context";
import { BlogCard } from "@/components/home/bento/cards/BlogCard";
import { HanabiCard } from "@/components/home/bento/cards/HanabiCard";
import { LikesCard } from "@/components/home/bento/cards/LikesCard";
import { ClockLcdCard } from "@/components/home/bento/cards/ClockLcdCard";
import { ClockAnalogCard } from "@/components/home/bento/cards/ClockAnalogCard";

const TODAY = new Date("2026-06-17T00:00:00Z");
const BLOG_POST = { title: "Test Post", publishedAt: TODAY };
const PHOTO = { src: "https://example.com/photo.jpg", alt: "test" };

describe("BentoStage responsive layout", () => {
  it("inner wrapper is flex-col on mobile and md:block (absolute canvas) on desktop", () => {
    const { container } = render(<BentoStage initialLayout={{}}><span>x</span></BentoStage>);
    const inner = container.firstChild?.firstChild as HTMLElement;
    expect(inner.className).toMatch(/flex/);
    expect(inner.className).toMatch(/flex-col/);
    expect(inner.className).toMatch(/gap-3/);
    expect(inner.className).toMatch(/md:block/);
    // Inner reference height grows with breakpoints (proportional to BENTO_REF_W/H).
    expect(inner.className).toMatch(/md:h-\[600px\]/);
    expect(inner.className).toMatch(/xl:h-\[750px\]/);
    expect(inner.className).toMatch(/2xl:h-\[886px\]/);
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

describe("Mobile bento curation: visible cards (with order) and hidden cards", () => {
  // Five cards remain visible on mobile, in this order:
  //   1. About  2. Blog  3. Photos  4. Hanabi  5. Likes
  // Each carries an explicit max-md:order-N for the flex column.
  const visible: Array<[string, number, () => React.ReactElement]> = [
    ["AboutCard",  1, () => <AboutCard enterIndex={0} />],
    ["BlogCard",   2, () => <BlogCard post={BLOG_POST} enterIndex={4} />],
    ["PhotosCard", 3, () => <PhotosCard photo={PHOTO} enterIndex={3} />],
    ["HanabiCard", 4, () => <HanabiCard enterIndex={5} />],
    ["LikesCard",  5, () => <LikesCard enterIndex={8} initialCount={0} />],
  ];

  visible.forEach(([name, order, factory]) => {
    it(`${name} is visible on mobile with max-md:order-${order}`, () => {
      const { container } = render(factory());
      const root = container.firstChild as HTMLElement;
      expect(root.className).not.toMatch(/max-md:hidden/);
      expect(root.className).toMatch(new RegExp(`max-md:order-${order}\\b`));
    });
  });

  it("the visible cards still carry the inline-geometry overrides", () => {
    const cards: Array<() => React.ReactElement> = [
      () => <AboutCard enterIndex={0} />,
      () => <BlogCard post={BLOG_POST} enterIndex={4} />,
      () => <PhotosCard photo={PHOTO} enterIndex={3} />,
      () => <HanabiCard enterIndex={5} />,
      () => <LikesCard enterIndex={8} initialCount={0} />,
    ];
    cards.forEach((factory) => {
      const { container } = render(factory());
      const root = container.firstChild as HTMLElement;
      ["max-md:!static", "max-md:!left-auto", "max-md:!top-auto", "max-md:!w-full", "max-md:!h-auto"].forEach((cls) => {
        expect(root.className).toMatch(new RegExp(cls.replace(/[[\]!]/g, "\\$&")));
      });
    });
  });

  // The other four cards are hidden entirely on mobile.
  const hidden: Array<[string, () => React.ReactElement]> = [
    ["CalendarCard",    () => <CalendarCard today={TODAY} enterIndex={1} />],
    ["MusicCard",       () => (
      <MusicPlayerProvider initialIndex={0}>
        <MusicCard enterIndex={2} />
      </MusicPlayerProvider>
    )],
    ["ClockLcdCard",    () => <ClockLcdCard enterIndex={6} />],
    ["ClockAnalogCard", () => <ClockAnalogCard enterIndex={7} />],
  ];

  hidden.forEach(([name, factory]) => {
    it(`${name} carries max-md:hidden`, () => {
      const { container } = render(factory());
      // MusicCard goes through a provider that prepends an <audio>; pick the
      // first non-AUDIO element as the card root.
      const root = (Array.from(container.children).find(
        (el) => el.tagName !== "AUDIO",
      ) ?? container.firstChild) as HTMLElement;
      expect(root.className).toMatch(/max-md:hidden/);
    });
  });
});
