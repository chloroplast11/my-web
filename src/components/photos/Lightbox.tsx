"use client";
import RYALightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import type { Photo } from "@prisma/client";
import { formatExifLine } from "@/lib/photo-exif";

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const fullUrl = (id: string) => `https://res.cloudinary.com/${CLOUD}/image/upload/q_auto,f_auto,w_2400/${id}`;

export function PhotoLightbox({ photos, openIndex, onClose }: {
  photos: Photo[]; openIndex: number | null; onClose: () => void;
}) {
  if (openIndex === null) return null;
  return (
    <RYALightbox
      open
      close={onClose}
      index={openIndex}
      plugins={[Captions]}
      captions={{ showToggle: true, descriptionTextAlign: "center" }}
      slides={photos.map((p) => ({
        src: fullUrl(p.cloudinaryPublicId),
        width: p.width, height: p.height, alt: p.caption ?? "",
        description: formatExifLine(p.exif) ?? undefined,
      }))}
    />
  );
}
