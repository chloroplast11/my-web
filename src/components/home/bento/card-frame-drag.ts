import { BENTO_REF_W, BENTO_REF_H, CLAMP_BUFFER } from "@/lib/bento-defaults";

export function clampAndScale(
  prev: { x: number; y: number },
  pixelOffset: { x: number; y: number },
  ctx: { renderedWidth: number; cardW: number; cardH: number },
): { x: number; y: number } {
  // The bento inner aspect ratio is locked (880:600). The card has been
  // rendered into that scaled box, so converting either axis by the width
  // ratio is correct.
  const scale = BENTO_REF_W / Math.max(ctx.renderedWidth, 1);
  const nextX = Math.round(prev.x + pixelOffset.x * scale);
  const nextY = Math.round(prev.y + pixelOffset.y * scale);
  const minX = -CLAMP_BUFFER;
  const maxX = BENTO_REF_W - ctx.cardW + CLAMP_BUFFER;
  const minY = -CLAMP_BUFFER;
  const maxY = BENTO_REF_H - ctx.cardH + CLAMP_BUFFER;
  const clampedX = Math.max(minX, Math.min(maxX, nextX));
  const clampedY = Math.max(minY, Math.min(maxY, nextY));
  return { x: clampedX, y: clampedY };
}
