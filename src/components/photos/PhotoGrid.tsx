"use client";
import { useState } from "react";
import type { Photo } from "@prisma/client";
import { BlurredImage } from "./BlurredImage";
import { PhotoLightbox } from "./Lightbox";
import { PhotoExifOverlay } from "./PhotoExifOverlay";

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <>
      <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
        {photos.map((p, i) => (
          <button
            key={p.id} type="button" onClick={() => setOpenIndex(i)}
            className="group relative block w-full text-left mb-4 break-inside-avoid rounded-lg overflow-hidden"
          >
            <BlurredImage
              publicId={p.cloudinaryPublicId} alt={p.caption ?? ""}
              width={p.width} height={p.height} blurDataUrl={p.blurDataUrl}
              sizes="(max-width:768px) 100vw, 33vw"
            />
            <PhotoExifOverlay exif={p.exif} />
          </button>
        ))}
      </div>
      <PhotoLightbox photos={photos} openIndex={openIndex} onClose={() => setOpenIndex(null)} />
    </>
  );
}
