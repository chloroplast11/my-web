import Link from "next/link";
import { CardFrame } from "../CardFrame";

export type PhotoPreview = { src: string; alt?: string | null } | null;

export function PhotosCard({
  photo,
  enterIndex,
}: {
  photo: PhotoPreview;
  enterIndex: number;
}) {
  return (
    <CardFrame
      finalRotation={-1}
      enterIndex={enterIndex}
      style={{ left: 570, top: 190, width: 200, height: 160, backgroundColor: "#e6d9bc", borderColor: "#c8b896" }}
      className="overflow-hidden rounded-md border shadow-[0_4px_10px_rgba(36,30,23,0.12)] max-md:!static max-md:!left-auto max-md:!top-auto max-md:!w-full max-md:!h-auto max-md:col-span-2"
    >
      <Link href="/photos" className="relative block h-full w-full min-h-[120px]">
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo.src}
            alt={photo.alt ?? "photo preview"}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        )}
        <span className="absolute left-2 top-2 rounded bg-paper/80 px-1.5 py-0.5 text-[10px] text-muted backdrop-blur-sm">
          📷 photos
        </span>
      </Link>
    </CardFrame>
  );
}
