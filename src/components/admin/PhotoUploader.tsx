"use client";
import { useState } from "react";
import { getUploadCredentials, processBlobForUpload, recordUploadedPhoto } from "@/app/admin/_actions/photos";

export function PhotoUploader({ albums }: { albums: { id: string; name: string }[] }) {
  const [albumId, setAlbumId] = useState<string>("");
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

        const processForm = new FormData();
        processForm.append("file", file);

        const [cldRes, processed] = await Promise.all([
          fetch(`https://api.cloudinary.com/v1_1/${creds.cloudName}/image/upload`, {
            method: "POST", body: fd,
          }),
          processBlobForUpload(processForm),
        ]);
        if (!cldRes.ok) throw new Error(`Upload failed: ${cldRes.status}`);
        const json = await cldRes.json();

        await recordUploadedPhoto({
          cloudinaryPublicId: json.public_id,
          width: json.width,
          height: json.height,
          blurhash: processed.blurhash,
          blurDataUrl: processed.blurDataUrl,
          exif: processed.exif,
          takenAt: processed.takenAt,
          albumId: albumId || null,
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
    <div className="border border-dashed border-line rounded-xl p-8 text-center space-y-4">
      <select
        value={albumId}
        onChange={(e) => setAlbumId(e.target.value)}
        className="border border-line rounded p-2"
        disabled={uploading}
      >
        <option value="">No album</option>
        {albums.map((a) => (
          <option key={a.id} value={a.id}>{a.name}</option>
        ))}
      </select>
      <div>
        <input id="file" type="file" accept="image/*" multiple onChange={onChange} disabled={uploading} className="hidden" />
        <label htmlFor="file" className="cursor-pointer px-5 py-3 rounded-full bg-ink text-paper inline-block">
          {uploading ? "Uploading…" : "Upload photos"}
        </label>
      </div>
      {error && <p className="text-red-700 text-sm">{error}</p>}
    </div>
  );
}
