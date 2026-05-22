export const PROPERTY_PHOTOS_BUCKET = "property-photos";
export const MAX_PROPERTY_PHOTOS = 3;
export const MAX_PROPERTY_PHOTO_BYTES = 1024 * 1024;

export function getPropertyPhotoPublicUrl(storagePath: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return null;
  return `${base}/storage/v1/object/public/${PROPERTY_PHOTOS_BUCKET}/${storagePath}`;
}
