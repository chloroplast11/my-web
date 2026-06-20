import Link from "next/link";
import { CardFrame } from "../CardFrame";

export type PhotoPreview = { src: string; alt?: string | null } | null;

const MOUNT =
  "before:absolute before:left-1 before:top-1 before:h-4 before:w-4 before:bg-ink/80 before:[clip-path:polygon(0_0,100%_0,0_100%)] " +
  "after:absolute after:right-1 after:top-1 after:h-4 after:w-4 after:bg-ink/80 after:[clip-path:polygon(0_0,100%_0,100%_100%)]";

export function PhotosCard({ photo, enterIndex }: { photo: PhotoPreview; enterIndex: number }) {
  return (
    <CardFrame
      cardId="photos"
      finalRotation={0}
      enterIndex={enterIndex}
      className="overflow-hidden rounded-md border border-line-2 bg-paper p-3 shadow-[0_4px_10px_rgba(36,30,23,0.12)] max-md:!static max-md:!left-auto max-md:!top-auto max-md:!w-full max-md:!h-auto max-md:col-span-2"
    >
      <Link
        href="/photos"
        aria-label="photos"
        className={`relative block h-full w-full ${MOUNT}`}
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent 0 6px, rgba(36,30,23,0.02) 6px 7px)",
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo.src}
              alt={photo.alt ?? "photo preview"}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          )}
        </div>
        {/* bottom-left + bottom-right corner mounts */}
        <span
          aria-hidden="true"
          className="absolute left-1 bottom-1 h-4 w-4 bg-ink/80"
          style={{ clipPath: "polygon(0 100%, 100% 100%, 0 0)" }}
        />
        <span
          aria-hidden="true"
          className="absolute right-1 bottom-1 h-4 w-4 bg-ink/80"
          style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }}
        />
        <span className="absolute left-3 top-3 rounded bg-paper/80 px-2 py-1 text-[11px] font-medium text-muted backdrop-blur-sm xl:text-[13px] 2xl:text-[15px]">
          📷 photos
        </span>
        {photo?.alt && (
          <span className="absolute bottom-3 right-3 rounded bg-ink/55 px-2 py-1 text-[10px] text-surface backdrop-blur-sm xl:text-[12px] 2xl:text-[14px]">
            {photo.alt}
          </span>
        )}
      </Link>
    </CardFrame>
  );
}
