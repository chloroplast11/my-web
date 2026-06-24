import { BENTO_REF_W, BENTO_REF_H, CLAMP_BUFFER, type CardBox } from "@/lib/bento-defaults";

export type Corner = "tl" | "tr" | "bl" | "br";

export function clampAndScaleResize(
  prev: CardBox,
  corner: Corner,
  pixelOffset: { x: number; y: number },
  ctx: { renderedWidth: number; minW: number; minH: number },
): CardBox {
  // Same width-ratio scaling trick as clampAndScale: the bento aspect
  // is locked, so width ratio converts both axes from rendered px to
  // ref px.
  const scale = BENTO_REF_W / Math.max(ctx.renderedWidth, 1);
  const dx = Math.round(pixelOffset.x * scale);
  const dy = Math.round(pixelOffset.y * scale);

  // Per-corner delta: which fields change and in which direction.
  let nextX = prev.x;
  let nextY = prev.y;
  let nextW = prev.w;
  let nextH = prev.h;

  switch (corner) {
    case "br":
      nextW = prev.w + dx;
      nextH = prev.h + dy;
      break;
    case "bl":
      nextX = prev.x + dx;
      nextW = prev.w - dx;
      nextH = prev.h + dy;
      break;
    case "tr":
      nextY = prev.y + dy;
      nextW = prev.w + dx;
      nextH = prev.h - dy;
      break;
    case "tl":
      nextX = prev.x + dx;
      nextY = prev.y + dy;
      nextW = prev.w - dx;
      nextH = prev.h - dy;
      break;
  }

  // Enforce minW: if the box would go below minW, clamp and re-anchor
  // x so the opposite (right) edge stays put. Only matters when we are
  // pulling x inward (tl / bl).
  if (nextW < ctx.minW) {
    if (corner === "tl" || corner === "bl") {
      // Right edge of previous = prev.x + prev.w. We want
      // nextX + minW = prev.x + prev.w  ⇒  nextX = prev.x + prev.w - minW.
      nextX = prev.x + prev.w - ctx.minW;
    }
    nextW = ctx.minW;
  }
  if (nextH < ctx.minH) {
    if (corner === "tl" || corner === "tr") {
      nextY = prev.y + prev.h - ctx.minH;
    }
    nextH = ctx.minH;
  }

  // Canvas-edge clamp with CLAMP_BUFFER overflow allowance.
  const maxW = BENTO_REF_W + 2 * CLAMP_BUFFER;
  const maxH = BENTO_REF_H + 2 * CLAMP_BUFFER;
  nextW = Math.min(nextW, maxW);
  nextH = Math.min(nextH, maxH);

  const minX = -CLAMP_BUFFER;
  const maxX = BENTO_REF_W - nextW + CLAMP_BUFFER;
  const minY = -CLAMP_BUFFER;
  const maxY = BENTO_REF_H - nextH + CLAMP_BUFFER;
  nextX = Math.max(minX, Math.min(maxX, nextX));
  nextY = Math.max(minY, Math.min(maxY, nextY));

  return {
    x: Math.round(nextX),
    y: Math.round(nextY),
    w: Math.round(nextW),
    h: Math.round(nextH),
  };
}
