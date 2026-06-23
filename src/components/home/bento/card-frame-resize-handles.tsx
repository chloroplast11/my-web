"use client";

import { motion, type PanInfo } from "framer-motion";
import type { Corner } from "./card-frame-resize";

type Props = {
  onResize: (corner: Corner, pixelOffset: { x: number; y: number }) => void;
  onCommit: (corner: Corner, pixelOffset: { x: number; y: number }) => void;
};

const CORNER_POSITION: Record<Corner, string> = {
  tl: "top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize",
  tr: "top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize",
  bl: "bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize",
  br: "bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize",
};

const CORNERS: Corner[] = ["tl", "tr", "bl", "br"];

export function ResizeHandles({ onResize, onCommit }: Props) {
  return (
    <>
      {CORNERS.map((corner) => (
        <motion.div
          key={corner}
          data-resize-handle={corner}
          className={[
            "absolute z-10 h-3 w-3 rounded-sm bg-cinnabar/60",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
            // Hit area enlarged via a pseudo-element so the visual stays small.
            "before:absolute before:inset-[-4px] before:content-['']",
            CORNER_POSITION[corner],
          ].join(" ")}
          onPointerDown={(e) => e.stopPropagation()}
          onPan={(_, info: PanInfo) => onResize(corner, info.offset)}
          onPanEnd={(_, info: PanInfo) => onCommit(corner, info.offset)}
        />
      ))}
    </>
  );
}
