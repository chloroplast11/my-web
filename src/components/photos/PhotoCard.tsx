import { BlurredImage } from "./BlurredImage";

export function PhotoCard({
  publicId, alt, width, height, blurDataUrl,
}: { publicId: string; alt: string; width: number; height: number; blurDataUrl?: string | null }) {
  return (
    <div className="rounded-lg overflow-hidden mb-4 break-inside-avoid">
      <BlurredImage publicId={publicId} alt={alt} width={width} height={height} blurDataUrl={blurDataUrl} />
    </div>
  );
}
