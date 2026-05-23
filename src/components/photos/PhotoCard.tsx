import Image from "next/image";

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export function PhotoCard({
  publicId, alt, width, height,
}: { publicId: string; alt: string; width: number; height: number }) {
  const src = `https://res.cloudinary.com/${CLOUD}/image/upload/q_auto,f_auto,w_900/${publicId}`;
  return (
    <div className="rounded-lg overflow-hidden mb-4 break-inside-avoid">
      <Image src={src} alt={alt} width={width} height={height}
        sizes="(max-width: 768px) 100vw, (max-width: 1140px) 50vw, 33vw"
        className="w-full h-auto" />
    </div>
  );
}
