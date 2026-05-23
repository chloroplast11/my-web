import Image from "next/image";
import { listPhotos } from "@/lib/db/photos";
import { prisma } from "@/lib/prisma";
import { PhotoUploader } from "@/components/admin/PhotoUploader";
import { deletePhoto } from "@/app/admin/_actions/photos";
import { DeleteButton } from "@/components/ui/DeleteButton";

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

function thumbUrl(publicId: string) {
  return `https://res.cloudinary.com/${CLOUD}/image/upload/w_400,h_400,c_fill,q_auto,f_auto/${publicId}`;
}

export default async function AdminPhotosPage() {
  const [photos, albums] = await Promise.all([
    listPhotos(),
    prisma.album.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl">Photos</h1>
      <PhotoUploader albums={albums} />
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {photos.map((p) => (
          <div key={p.id} className="relative group rounded-lg overflow-hidden border border-line">
            <Image src={thumbUrl(p.cloudinaryPublicId)} alt={p.caption ?? ""} width={400} height={400} className="object-cover w-full aspect-square" />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
              <DeleteButton
                action={async () => { "use server"; await deletePhoto(p.id); }}
                itemLabel={p.caption || "this photo"}
                className="bg-ink text-paper px-2 py-1 rounded"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
