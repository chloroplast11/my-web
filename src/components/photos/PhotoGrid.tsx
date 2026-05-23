import type { Photo } from "@prisma/client";
import { PhotoCard } from "./PhotoCard";

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
      {photos.map((p) => (
        <PhotoCard key={p.id} publicId={p.cloudinaryPublicId} alt={p.caption ?? ""} width={p.width} height={p.height} blurDataUrl={p.blurDataUrl} />
      ))}
    </div>
  );
}
