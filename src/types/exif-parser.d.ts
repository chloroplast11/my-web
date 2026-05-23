declare module "exif-parser" {
  interface ExifTags {
    Make?: string;
    Model?: string;
    LensModel?: string;
    FNumber?: number;
    ExposureTime?: number;
    ISO?: number;
    FocalLength?: number;
    FocalLengthIn35mmFormat?: number;
    DateTimeOriginal?: number;
    [key: string]: unknown;
  }

  interface ExifResult {
    tags?: ExifTags;
    imageSize?: { width: number; height: number };
    thumbnailOffset?: number;
    thumbnailLength?: number;
    thumbnailType?: number;
    app1Offset?: number;
  }

  interface ExifParserInstance {
    parse(): ExifResult;
    enableBinaryFields(enable: boolean): ExifParserInstance;
    enableTagNames(enable: boolean): ExifParserInstance;
    enableImageSize(enable: boolean): ExifParserInstance;
    enableReturnTags(enable: boolean): ExifParserInstance;
  }

  const ExifParser: {
    create(buffer: Buffer | Uint8Array): ExifParserInstance;
  };
  export default ExifParser;
}
