import { BENTO_DEFAULTS, type CardId, type Layout, type CardBox } from "@/lib/bento-defaults";

// Hydrate a (potentially sparse) Layout into a complete CardBox map.
// Missing cards or missing w/h fields fall back to BENTO_DEFAULTS so every
// consumer downstream sees a full {x, y, w, h} per card.
export function mergeLayout(initial: Layout): Record<CardId, CardBox> {
  const out: Record<CardId, CardBox> = {} as Record<CardId, CardBox>;
  for (const id of Object.keys(BENTO_DEFAULTS) as CardId[]) {
    const def = BENTO_DEFAULTS[id];
    const saved = initial[id];
    out[id] = {
      x: saved?.x ?? def.x,
      y: saved?.y ?? def.y,
      w: saved?.w ?? def.w,
      h: saved?.h ?? def.h,
    };
  }
  return out;
}
