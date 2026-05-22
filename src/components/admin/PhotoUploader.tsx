"use client";
import { useState } from "react";
import { getUploadCredentials, recordUploadedPhoto } from "@/app/admin/_actions/photos";

export function PhotoUploader() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of files) {
        const creds = await getUploadCredentials();
        const fd = new FormData();
        fd.append("file", file);
        fd.append("api_key", creds.apiKey);
        fd.append("timestamp", String(creds.timestamp));
        fd.append("signature", creds.signature);
        fd.append("folder", creds.folder);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${creds.cloudName}/image/upload`, {
          method: "POST", body: fd,
        });
        if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
        const json = await res.json();
        await recordUploadedPhoto({
          cloudinaryPublicId: json.public_id,
          width: json.width,
          height: json.height,
        });
      }
      e.target.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="border border-dashed border-line rounded-xl p-8 text-center">
      <input id="file" type="file" accept="image/*" multiple onChange={onChange} disabled={uploading} className="hidden" />
      <label htmlFor="file" className="cursor-pointer px-5 py-3 rounded-full bg-ink text-paper inline-block">
        {uploading ? "Uploading…" : "Upload photos"}
      </label>
      {error && <p className="text-red-700 text-sm mt-3">{error}</p>}
    </div>
  );
}
