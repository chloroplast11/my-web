import sharp from "sharp";
import { encode, decode } from "blurhash";
import ExifParser from "exif-parser";

export type ProcessedImage = {
  width: number;
  height: number;
  blurhash: string;
  blurDataUrl: string;
  exif: Record<string, unknown> | null;
  takenAt: Date | null;
};

export async function processImage(buffer: Buffer): Promise<ProcessedImage> {
  const image = sharp(buffer);
  const meta = await image.metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  const { data, info } = await image
    .clone()
    .resize(32, 32, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const blurhash = encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4);

  const pixels = decode(blurhash, 32, 32);
  const png = await sharp(Buffer.from(pixels), { raw: { width: 32, height: 32, channels: 4 } })
    .png()
    .toBuffer();
  const blurDataUrl = `data:image/png;base64,${png.toString("base64")}`;

  let exif: Record<string, unknown> | null = null;
  let takenAt: Date | null = null;
  try {
    const parsed = ExifParser.create(buffer).parse();
    const tags = parsed.tags ?? {};
    const safe: Record<string, unknown> = {
      make: tags.Make,
      model: tags.Model,
      lens: tags.LensModel,
      fNumber: tags.FNumber,
      exposureTime: tags.ExposureTime,
      iso: tags.ISO,
      focalLength: tags.FocalLength,
      focalLengthIn35mm: tags.FocalLengthIn35mmFormat,
    };
    Object.keys(safe).forEach((k) => safe[k] === undefined && delete safe[k]);
    exif = Object.keys(safe).length ? safe : null;
    if (typeof tags.DateTimeOriginal === "number") {
      takenAt = new Date(tags.DateTimeOriginal * 1000);
    }
  } catch {
    /* not all images have EXIF — fine */
  }

  return { width, height, blurhash, blurDataUrl, exif, takenAt };
}
