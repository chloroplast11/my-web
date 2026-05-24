"use client";
import RYALightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import type { Photo } from "@prisma/client";
import { formatExifLine } from "@/lib/photo-exif";

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const fullUrl = (id: string) =>
  /^https?:\/\//.test(id)
    ? id
    : `https://res.cloudinary.com/${CLOUD}/image/upload/q_auto,f_auto,w_2400/${id}`;

export type LightboxPhoto = Photo & { album?: { name: string } | null };

type Props = {
  photos: LightboxPhoto[];
  openIndex: number | null;
  onClose: () => void;
  hideExif?: boolean;
  hideAlbum?: boolean;
};

export function PhotoLightbox({ photos, openIndex, onClose, hideExif, hideAlbum }: Props) {
  if (openIndex === null) return null;
  return (
    <RYALightbox
      open
      close={onClose}
      index={openIndex}
      plugins={[Captions]}
      captions={{ showToggle: true, descriptionTextAlign: "center" }}
      slides={photos.map((p) => {
        const titleBits: string[] = [];
        if (!hideAlbum && p.album?.name) titleBits.push(p.album.name);
        if (p.caption) titleBits.push(p.caption);
        return {
          src: fullUrl(p.cloudinaryPublicId),
          width: p.width,
          height: p.height,
          alt: p.caption ?? "",
          title: titleBits.length > 0 ? titleBits.join(" — ") : undefined,
          description: hideExif ? undefined : (formatExifLine(p.exif) ?? undefined),
        };
      })}
    />
  );
}
