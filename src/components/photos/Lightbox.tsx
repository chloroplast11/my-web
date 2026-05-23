"use client";
import RYALightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import type { Photo } from "@prisma/client";

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const fullUrl = (id: string) => `https://res.cloudinary.com/${CLOUD}/image/upload/q_auto,f_auto,w_2400/${id}`;

function formatExif(e: Photo["exif"]): string | null {
  if (!e || typeof e !== "object") return null;
  const x = e as Record<string, unknown>;
  const parts: string[] = [];
  if (x.make || x.model) parts.push([x.make, x.model].filter(Boolean).join(" "));
  if (x.lens) parts.push(String(x.lens));
  if (x.focalLength) parts.push(`${x.focalLength}mm`);
  if (x.fNumber) parts.push(`f/${x.fNumber}`);
  if (x.exposureTime) {
    const t = Number(x.exposureTime);
    parts.push(t < 1 ? `1/${Math.round(1 / t)}s` : `${t}s`);
  }
  if (x.iso) parts.push(`ISO ${x.iso}`);
  return parts.join(" · ") || null;
}

export function PhotoLightbox({ photos, openIndex, onClose }: {
  photos: Photo[]; openIndex: number | null; onClose: () => void;
}) {
  if (openIndex === null) return null;
  return (
    <RYALightbox
      open
      close={onClose}
      index={openIndex}
      slides={photos.map((p) => ({
        src: fullUrl(p.cloudinaryPublicId),
        width: p.width, height: p.height, alt: p.caption ?? "",
        description: formatExif(p.exif) ?? undefined,
      }))}
    />
  );
}
