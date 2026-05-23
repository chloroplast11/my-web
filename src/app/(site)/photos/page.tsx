import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PhotoGrid } from "@/components/photos/PhotoGrid";
import { cn } from "@/lib/cn";

export default async function PhotosPage({
  searchParams,
}: {
  searchParams: Promise<{ album?: string }>;
}) {
  const { album } = await searchParams;
  const [albums, photos] = await Promise.all([
    prisma.album.findMany({ orderBy: { order: "asc" } }),
    prisma.photo.findMany({
      where: album ? { album: { slug: album } } : {},
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
  ]);
  return (
    <main className="px-[5vw] pt-32 pb-24 max-w-[var(--container-site)] mx-auto">
      <h1 className="font-serif text-[clamp(2rem,5vw,3.5rem)]">Photography</h1>
      <p className="text-muted mt-3">A running log of what catches my eye.</p>
      {albums.length > 0 && (
        <div className="flex gap-3 mt-8 flex-wrap">
          <Link
            href="/photos"
            className={cn("text-sm", !album ? "text-accent" : "text-muted")}
          >
            All
          </Link>
          {albums.map((a) => (
            <Link
              key={a.id}
              href={`/photos?album=${a.slug}`}
              className={cn("text-sm", album === a.slug ? "text-accent" : "text-muted")}
            >
              {a.name}
            </Link>
          ))}
        </div>
      )}
      <div className="mt-12">
        {photos.length === 0 ? (
          <p className="text-muted">No photos yet.</p>
        ) : (
          <PhotoGrid photos={photos} />
        )}
      </div>
    </main>
  );
}
