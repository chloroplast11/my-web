import { z } from "zod";

export const CARD_IDS = [
  "about",
  "calendar",
  "music",
  "photos",
  "blog",
  "hanabi",
  "clock-lcd",
  "clock-analog",
  "likes",
  "write",
] as const;

export type CardId = (typeof CARD_IDS)[number];

// A card's persisted box: position AND size, in ref-canvas px.
export type CardBox = { x: number; y: number; w: number; h: number };
// Layout is the raw/stored shape — w/h may be absent in legacy blobs.
// mergeLayout hydrates missing w/h from BENTO_DEFAULTS before use.
export type Layout = Partial<Record<CardId, { x: number; y: number; w?: number; h?: number }>>;

// `minW` / `minH` are the per-card lower bounds enforced by resize.
export type CardDefaults = {
  x: number; y: number;
  w: number; h: number;
  minW: number; minH: number;
};

export const BENTO_REF_W = 880;
export const BENTO_REF_H = 600;

// How far a dragged or resized card may overflow the canvas, in ref px.
export const CLAMP_BUFFER = 120;

export const BENTO_DEFAULTS: Record<CardId, CardDefaults> = Object.freeze({
  about:          { x:  30, y: 130, w: 240, h: 230, minW: 160, minH: 160 },
  calendar:       { x: 350, y: 130, w: 160, h: 175, minW: 120, minH: 140 },
  photos:         { x: 605, y: 130, w: 250, h: 245, minW: 160, minH: 160 },
  "clock-lcd":    { x: 350, y: 330, w: 200, h:  80, minW: 140, minH:  60 },
  blog:           { x:  30, y: 390, w: 290, h: 170, minW: 200, minH: 120 },
  "clock-analog": { x: 660, y: 395, w: 120, h: 120, minW:  80, minH:  80 },
  music:          { x: 340, y: 450, w: 260, h:  56, minW: 180, minH:  44 },
  hanabi:         { x: 350, y: 532, w: 220, h:  65, minW: 140, minH:  50 },
  likes:          { x: 790, y: 440, w:  80, h:  85, minW:  60, minH:  60 },
  write:          { x: 690, y: 340, w: 100, h:  44, minW:  60, minH:  32 },
}) as Record<CardId, CardDefaults>;

// Shared x/y constraints reused by both read and write schemas.
const xyShape = {
  x: z.number().int().min(-CLAMP_BUFFER).max(BENTO_REF_W + CLAMP_BUFFER),
  y: z.number().int().min(-CLAMP_BUFFER).max(BENTO_REF_H + CLAMP_BUFFER),
};
const wField = z.number().int().min(40).max(BENTO_REF_W + 2 * CLAMP_BUFFER);
const hField = z.number().int().min(40).max(BENTO_REF_H + 2 * CLAMP_BUFFER);

// Read schema tolerates legacy saved blobs that contain only {x, y}.
export const cardBoxReadSchema = z.object({
  ...xyShape,
  w: wField.optional(),
  h: hField.optional(),
});

// Write schema requires the full box — used by the PUT API.
export const cardBoxWriteSchema = z.object({
  ...xyShape,
  w: wField,
  h: hField,
});

export const layoutReadSchema = z.object({
  about: cardBoxReadSchema.optional(),
  calendar: cardBoxReadSchema.optional(),
  music: cardBoxReadSchema.optional(),
  photos: cardBoxReadSchema.optional(),
  blog: cardBoxReadSchema.optional(),
  hanabi: cardBoxReadSchema.optional(),
  "clock-lcd": cardBoxReadSchema.optional(),
  "clock-analog": cardBoxReadSchema.optional(),
  likes: cardBoxReadSchema.optional(),
  write: cardBoxReadSchema.optional(),
});

export const layoutWriteSchema = z.object({
  about: cardBoxWriteSchema.optional(),
  calendar: cardBoxWriteSchema.optional(),
  music: cardBoxWriteSchema.optional(),
  photos: cardBoxWriteSchema.optional(),
  blog: cardBoxWriteSchema.optional(),
  hanabi: cardBoxWriteSchema.optional(),
  "clock-lcd": cardBoxWriteSchema.optional(),
  "clock-analog": cardBoxWriteSchema.optional(),
  likes: cardBoxWriteSchema.optional(),
  write: cardBoxWriteSchema.optional(),
});
