import { prisma } from "@/lib/prisma";
import { createAlbum } from "@/app/admin/_actions/albums";

export default async function AlbumsPage() {
  const albums = await prisma.album.findMany({
    include: { _count: { select: { photos: true } } },
    orderBy: { order: "asc" },
  });
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl">Albums</h1>
      <form action={createAlbum} className="flex gap-2">
        <input
          name="name"
          required
          placeholder="New album"
          className="border border-line p-2 rounded flex-1"
        />
        <button className="px-4 py-2 bg-ink text-paper rounded">Create</button>
      </form>
      <ul className="divide-y divide-line">
        {albums.map((a) => (
          <li key={a.id} className="py-3 flex justify-between">
            <span>
              {a.name}
              <span className="text-muted text-sm ml-2">/{a.slug}</span>
            </span>
            <span className="text-muted text-sm">{a._count.photos} photos</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
