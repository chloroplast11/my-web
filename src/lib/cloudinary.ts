import { v2 as cloudinary } from "cloudinary";

export function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

export function buildSignedUploadParams(opts: { folder: string }) {
  const c = configureCloudinary();
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = c.utils.api_sign_request(
    { timestamp, folder: opts.folder },
    process.env.CLOUDINARY_API_SECRET!,
  );
  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    folder: opts.folder,
  };
}

export { cloudinary };
