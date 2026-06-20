"use client";

import { createContext, useContext } from "react";
import type { CardId, Position } from "@/lib/bento-defaults";

export type BentoLayoutContextValue = {
  layout: Record<CardId, Position>;
  setCardPosition: (id: CardId, position: Position) => void;
  editMode: boolean;
};

export const BentoLayoutContext = createContext<BentoLayoutContextValue | null>(null);

export function useBentoLayout(): BentoLayoutContextValue | null {
  return useContext(BentoLayoutContext);
}
