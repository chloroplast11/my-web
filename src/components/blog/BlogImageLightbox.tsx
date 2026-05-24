"use client";
import { useEffect, useRef, useState } from "react";
import { PhotoLightbox, type LightboxPhoto } from "@/components/photos/Lightbox";

export function BlogImageLightbox({ html }: { html: string }) {
  const ref = useRef<HTMLElement>(null);
  const [photos, setPhotos] = useState<LightboxPhoto[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const imgs = Array.from(root.querySelectorAll("img"));

    const collect = () => {
      setPhotos(
        imgs.map((img, i) => ({
          id: `blog-img-${i}`,
          caption: img.alt || null,
          cloudinaryPublicId: img.src,
          width: img.naturalWidth || 1600,
          height: img.naturalHeight || 1067,
          blurhash: null,
          blurDataUrl: null,
          exif: null,
          takenAt: null,
          order: 0,
          createdAt: new Date(),
          albumId: null,
          album: null,
        }) as unknown as LightboxPhoto),
      );
    };

    imgs.forEach((img, i) => {
      img.style.cursor = "pointer";
      img.dataset.lightboxIndex = String(i);
      if (!img.complete) img.addEventListener("load", collect);
    });
    collect();

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName !== "IMG") return;
      const idx = Number((t as HTMLImageElement).dataset.lightboxIndex);
      if (Number.isFinite(idx)) {
        e.preventDefault();
        setOpenIndex(idx);
      }
    };
    root.addEventListener("click", onClick);
    return () => {
      root.removeEventListener("click", onClick);
      imgs.forEach((img) => img.removeEventListener("load", collect));
    };
  }, [html]);

  return (
    <>
      <article
        ref={ref}
        className="prose prose-stone max-w-none prose-headings:font-serif prose-pre:bg-surface prose-pre:border prose-pre:border-line prose-pre:rounded-xl"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <PhotoLightbox photos={photos} openIndex={openIndex} onClose={() => setOpenIndex(null)} hideExif hideAlbum />
    </>
  );
}
