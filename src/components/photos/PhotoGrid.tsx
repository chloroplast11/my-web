"use client";
import { useState } from "react";
import type { Photo } from "@prisma/client";
import { BlurredImage } from "./BlurredImage";
import { PhotoLightbox } from "./Lightbox";
import { summarizeExif } from "@/lib/photo-exif";

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <>
      <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
        {photos.map((p, i) => {
          const exif = summarizeExif(p.exif);
          return (
            <button
              key={p.id} type="button" onClick={() => setOpenIndex(i)}
              className="group relative block w-full text-left mb-4 break-inside-avoid rounded-lg overflow-hidden"
            >
              <BlurredImage
                publicId={p.cloudinaryPublicId} alt={p.caption ?? ""}
                width={p.width} height={p.height} blurDataUrl={p.blurDataUrl}
                sizes="(max-width:768px) 100vw, 33vw"
              />
              {exif && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 py-3 text-white text-[11.5px] tracking-wide bg-gradient-to-t from-black/55 to-transparent opacity-0 translate-y-2 transition duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                  {exif.camera && <div className="font-serif italic text-[13px] mb-1">{exif.camera}</div>}
                  {exif.settings && <div>{exif.settings}</div>}
                </div>
              )}
            </button>
          );
        })}
      </div>
      <PhotoLightbox photos={photos} openIndex={openIndex} onClose={() => setOpenIndex(null)} />
    </>
  );
}
