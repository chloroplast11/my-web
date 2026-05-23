import Image from "next/image";

export function BlurredImage({
  publicId, alt, width, height, blurDataUrl, sizes,
}: { publicId: string; alt: string; width: number; height: number; blurDataUrl?: string | null; sizes?: string }) {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const src = `https://res.cloudinary.com/${cloud}/image/upload/q_auto,f_auto,w_1200/${publicId}`;
  return (
    <Image
      src={src} alt={alt} width={width} height={height} sizes={sizes ?? "(max-width:768px) 100vw, 50vw"}
      placeholder={blurDataUrl ? "blur" : "empty"}
      blurDataURL={blurDataUrl ?? undefined}
      className="w-full h-auto"
    />
  );
}
