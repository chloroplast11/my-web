import { prisma } from "@/lib/prisma";
import { listFeatured } from "@/lib/db/featured";
import { FeaturedManager } from "@/components/admin/FeaturedManager";

export default async function AdminFeaturedPage() {
  const [featured, allPosts, allPhotos] = await Promise.all([
    listFeatured(),
    prisma.post.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
      select: { id: true, title: true },
    }),
    prisma.photo.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, caption: true, cloudinaryPublicId: true },
    }),
  ]);

  const postRowIds = new Set(featured.filter((f) => f.kind === "post").map((f) => f.refId));
  const photoRowIds = new Set(featured.filter((f) => f.kind === "photo").map((f) => f.refId));

  const postRows = featured
    .filter((f) => f.kind === "post")
    .map((f) => ({
      ...f,
      label: allPosts.find((p) => p.id === f.refId)?.title ?? "(missing)",
    }));
  const photoRows = featured
    .filter((f) => f.kind === "photo")
    .map((f) => ({
      ...f,
      label:
        allPhotos.find((ph) => ph.id === f.refId)?.caption
        || allPhotos.find((ph) => ph.id === f.refId)?.cloudinaryPublicId
        || "(missing)",
    }));

  const postOptions = allPosts.filter((p) => !postRowIds.has(p.id)).map((p) => ({ id: p.id, label: p.title }));
  const photoOptions = allPhotos
    .filter((ph) => !photoRowIds.has(ph.id))
    .map((ph) => ({ id: ph.id, label: ph.caption || ph.cloudinaryPublicId }));

  return (
    <div className="space-y-12">
      <h1 className="font-serif text-3xl">Featured on Home</h1>
      <section>
        <h2 className="font-serif text-xl mb-4">Posts</h2>
        <FeaturedManager kind="post" rows={postRows} options={postOptions} />
      </section>
      <section>
        <h2 className="font-serif text-xl mb-4">Photos</h2>
        <FeaturedManager kind="photo" rows={photoRows} options={photoOptions} />
      </section>
    </div>
  );
}
