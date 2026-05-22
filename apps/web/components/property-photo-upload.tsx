"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { MAX_PROPERTY_PHOTOS } from "@/lib/property-photos";
import type { PropertyPhotoRow } from "@/lib/admin-data";

type PropertyPhotoUploadProps = {
  propertyId: string;
  initialPhotos: PropertyPhotoRow[];
};

export function PropertyPhotoUpload({ propertyId, initialPhotos }: PropertyPhotoUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const slotsLeft = MAX_PROPERTY_PHOTOS - photos.length;

  async function uploadPhoto(file: File) {
    setUploading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData();
    formData.set("property_id", propertyId);
    formData.set("photo", file);

    const response = await fetch("/api/admin/properties/photos", {
      method: "POST",
      body: formData,
      credentials: "include"
    });
    const payload = (await response.json()) as {
      error?: string;
      photo?: PropertyPhotoRow;
    };

    setUploading(false);

    if (!response.ok) {
      setError(payload.error ?? "Upload failed.");
      return;
    }

    if (payload.photo) {
      const url = payload.photo.url ?? null;
      setPhotos((current) => [
        ...current,
        {
          id: payload.photo!.id,
          storage_path: payload.photo!.storage_path,
          sort_order: payload.photo!.sort_order,
          created_at: payload.photo!.created_at,
          url
        }
      ]);
    }

    setMessage("Photo uploaded and compressed.");
    router.refresh();
    if (inputRef.current) inputRef.current.value = "";
  }

  async function removePhoto(photoId: string) {
    setRemovingId(photoId);
    setError(null);
    setMessage(null);

    const response = await fetch(`/api/admin/properties/photos/${photoId}`, {
      method: "DELETE",
      credentials: "include"
    });
    const payload = (await response.json()) as { error?: string };

    setRemovingId(null);

    if (!response.ok) {
      setError(payload.error ?? "Could not remove photo.");
      return;
    }

    setPhotos((current) => current.filter((photo) => photo.id !== photoId));
    setMessage("Photo removed.");
    router.refresh();
  }

  return (
    <section className="crm-card lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-black text-forest">Photos</h2>
        <p className="text-xs font-semibold text-slate">
          {photos.length}/{MAX_PROPERTY_PHOTOS} uploaded · max 1MB each after compression
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {photos.map((photo) => (
          <div key={photo.id} className="relative overflow-hidden rounded-xl border border-cloud bg-cream">
            {photo.url ? (
              <Image src={photo.url} alt="Property" width={400} height={280} className="h-40 w-full object-cover" unoptimized />
            ) : (
              <div className="grid h-40 place-items-center text-sm text-slate">Preview unavailable</div>
            )}
            <button
              type="button"
              disabled={removingId === photo.id}
              onClick={() => removePhoto(photo.id)}
              className="absolute right-2 top-2 rounded-lg border border-cloud bg-white/95 px-2 py-1 text-xs font-bold text-ember hover:bg-rose-50 disabled:opacity-60"
            >
              {removingId === photo.id ? "Removing…" : "Remove"}
            </button>
          </div>
        ))}
      </div>

      {slotsLeft > 0 ? (
        <div className="mt-4">
          <label className="grid gap-2 text-sm">
            <span className="font-semibold text-slate">Add photo ({slotsLeft} slot{slotsLeft === 1 ? "" : "s"} left)</span>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploading}
              className="rounded-lg border border-cloud bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-forest file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadPhoto(file);
              }}
            />
          </label>
          {uploading ? <p className="mt-2 text-sm font-semibold text-forest">Compressing and uploading…</p> : null}
        </div>
      ) : (
        <p className="mt-4 text-sm text-slate">Maximum {MAX_PROPERTY_PHOTOS} photos reached. Remove one to upload another.</p>
      )}

      {message ? <p className="mt-3 text-sm font-semibold text-forest">{message}</p> : null}
      {error ? <p className="mt-3 text-sm font-semibold text-ember">{error}</p> : null}
    </section>
  );
}
