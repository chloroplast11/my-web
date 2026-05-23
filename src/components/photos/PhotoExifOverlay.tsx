import type { Photo } from "@prisma/client";
import { summarizeExif } from "@/lib/photo-exif";

export function PhotoExifOverlay({ exif }: { exif: Photo["exif"] }) {
  const s = summarizeExif(exif);
  if (!s) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 py-3 text-white text-[11.5px] tracking-wide bg-gradient-to-t from-black/55 to-transparent opacity-0 translate-y-2 transition duration-300 group-hover:opacity-100 group-hover:translate-y-0">
      {s.camera && <div className="font-serif italic text-[13px] mb-1">{s.camera}</div>}
      {s.settings && <div>{s.settings}</div>}
    </div>
  );
}
