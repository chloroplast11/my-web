"use client";

import { createContext, useContext } from "react";
import type { CardId, CardBox } from "@/lib/bento-defaults";

export type BentoLayoutContextValue = {
  layout: Record<CardId, CardBox>;
  setCardBox: (id: CardId, box: CardBox) => void;
  editMode: boolean;
};

export const BentoLayoutContext = createContext<BentoLayoutContextValue | null>(null);

export function useBentoLayout(): BentoLayoutContextValue | null {
  return useContext(BentoLayoutContext);
}
