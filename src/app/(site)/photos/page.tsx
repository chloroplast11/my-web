import { listPhotos } from "@/lib/db/photos";
import { PhotoGrid } from "@/components/photos/PhotoGrid";

export default async function PhotosPage() {
  const photos = await listPhotos();
  return (
    <main className="px-[5vw] pt-32 pb-24 max-w-[var(--container-site)] mx-auto">
      <h1 className="font-serif text-[clamp(2rem,5vw,3.5rem)]">Photography</h1>
      <p className="text-muted mt-3 mb-12">A running log of what catches my eye.</p>
      {photos.length === 0 ? (
        <p className="text-muted">No photos yet.</p>
      ) : (
        <PhotoGrid photos={photos} />
      )}
    </main>
  );
}
