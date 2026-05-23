import type { Photo } from "@prisma/client";

export type ExifSummary = {
  camera: string | null;
  settings: string | null;
};

export function summarizeExif(e: Photo["exif"]): ExifSummary | null {
  if (!e || typeof e !== "object") return null;
  const x = e as Record<string, unknown>;

  const cameraParts: string[] = [];
  if (x.make || x.model) cameraParts.push([x.make, x.model].filter(Boolean).join(" "));
  if (x.lens) cameraParts.push(String(x.lens));
  if (x.focalLength) cameraParts.push(`${x.focalLength}mm`);

  const settingParts: string[] = [];
  if (x.fNumber) settingParts.push(`f/${x.fNumber}`);
  if (x.exposureTime) {
    const t = Number(x.exposureTime);
    settingParts.push(t < 1 ? `1/${Math.round(1 / t)}s` : `${t}s`);
  }
  if (x.iso) settingParts.push(`ISO ${x.iso}`);

  const camera = cameraParts.join(" · ") || null;
  const settings = settingParts.join(" · ") || null;
  if (!camera && !settings) return null;
  return { camera, settings };
}

export function formatExifLine(e: Photo["exif"]): string | null {
  const s = summarizeExif(e);
  if (!s) return null;
  return [s.camera, s.settings].filter(Boolean).join(" · ");
}
