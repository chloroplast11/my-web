"use client";
import { useState } from "react";
import { BlurredImage } from "./BlurredImage";
import { PhotoExifOverlay } from "./PhotoExifOverlay";
import { PhotoLightbox, type LightboxPhoto } from "./Lightbox";

export function FeaturedPhotos({ photos }: { photos: LightboxPhoto[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {photos.map((p, i) => (
          <button
            key={p.id} type="button" onClick={() => setOpenIndex(i)}
            className="group relative block w-full text-left rounded-lg overflow-hidden"
          >
            <BlurredImage
              publicId={p.cloudinaryPublicId} alt={p.caption ?? ""}
              width={p.width} height={p.height} blurDataUrl={p.blurDataUrl}
              sizes="(max-width:768px) 50vw, 33vw"
            />
            <PhotoExifOverlay exif={p.exif} />
          </button>
        ))}
      </div>
      <PhotoLightbox photos={photos} openIndex={openIndex} onClose={() => setOpenIndex(null)} />
    </>
  );
}
