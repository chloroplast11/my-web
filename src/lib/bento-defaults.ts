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
] as const;

export type CardId = (typeof CARD_IDS)[number];

export type Position = { x: number; y: number };
export type Layout = Partial<Record<CardId, Position>>;

export type CardDefaults = { x: number; y: number; w: number; h: number };

export const BENTO_REF_W = 880;
export const BENTO_REF_H = 600;

// Round A's table verbatim. Frozen so accidental writes throw in dev.
export const BENTO_DEFAULTS: Record<CardId, CardDefaults> = Object.freeze({
  about:          { x:  30, y: 130, w: 240, h: 230 },
  calendar:       { x: 350, y: 130, w: 160, h: 175 },
  photos:         { x: 605, y: 130, w: 250, h: 245 },
  "clock-lcd":    { x: 350, y: 330, w: 200, h:  80 },
  blog:           { x:  30, y: 390, w: 290, h: 170 },
  "clock-analog": { x: 660, y: 395, w: 120, h: 120 },
  music:          { x: 340, y: 440, w: 260, h:  76 },
  hanabi:         { x: 350, y: 532, w: 220, h:  65 },
}) as Record<CardId, CardDefaults>;

const cardIdSchema = z.enum(CARD_IDS);

export const positionSchema = z.object({
  x: z.number().int().min(0).max(BENTO_REF_W),
  y: z.number().int().min(0).max(BENTO_REF_H),
});

// Create a schema that allows partial layouts (some cards missing, unknowns stripped)
const cardLayoutObject = CARD_IDS.reduce(
  (obj, cardId) => {
    obj[cardId] = positionSchema.optional();
    return obj;
  },
  {} as Record<CardId, z.ZodOptional<typeof positionSchema>>
);

export const layoutSchema = z.object(cardLayoutObject as any);
