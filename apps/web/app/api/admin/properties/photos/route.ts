import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdminRoute } from "@/lib/admin-api";
import { compressPropertyPhoto } from "@/lib/image-compress";
import { getPropertyPhotoPublicUrl, MAX_PROPERTY_PHOTOS, PROPERTY_PHOTOS_BUCKET } from "@/lib/property-photos";
import { getServiceClientOrThrow } from "@/lib/server";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg"]);

export async function POST(request: Request) {
  const auth = await requireAdminRoute();
  if (!auth.ok) return auth.response;

  const formData = await request.formData();
  const propertyId = String(formData.get("property_id") ?? "").trim();
  const file = formData.get("photo");

  if (!propertyId) {
    return NextResponse.json({ error: "Property id is required." }, { status: 400 });
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, or WebP images are allowed." }, { status: 400 });
  }

  const supabase = getServiceClientOrThrow();

  const { data: property, error: propertyError } = await supabase.from("properties").select("id, property_id").eq("id", propertyId).maybeSingle();
  if (propertyError || !property) {
    return NextResponse.json({ error: "Property not found." }, { status: 404 });
  }

  const { count, error: countError } = await supabase
    .from("property_photos")
    .select("id", { count: "exact", head: true })
    .eq("property_id", propertyId);
  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }
  if ((count ?? 0) >= MAX_PROPERTY_PHOTOS) {
    return NextResponse.json({ error: `Maximum ${MAX_PROPERTY_PHOTOS} photos per property.` }, { status: 400 });
  }

  let compressed;
  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    compressed = await compressPropertyPhoto(bytes);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not process image." },
      { status: 400 }
    );
  }

  const photoId = randomUUID();
  const storagePath = `${propertyId}/${photoId}.${compressed.extension}`;

  const { error: uploadError } = await supabase.storage.from(PROPERTY_PHOTOS_BUCKET).upload(storagePath, compressed.buffer, {
    contentType: compressed.contentType,
    upsert: false
  });
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const sortOrder = count ?? 0;
  const { data: row, error: insertError } = await supabase
    .from("property_photos")
    .insert({
      id: photoId,
      property_id: propertyId,
      storage_path: storagePath,
      sort_order: sortOrder
    })
    .select("id, storage_path, sort_order, created_at")
    .single();

  if (insertError) {
    await supabase.storage.from(PROPERTY_PHOTOS_BUCKET).remove([storagePath]);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await supabase.from("activities").insert({
    action: "Property Photo Added",
    entity_type: "property",
    entity_id: propertyId,
    description: `${auth.admin.email} uploaded photo ${sortOrder + 1} for ${property.property_id}`
  });

  return NextResponse.json({
    ok: true,
    photo: {
      ...row,
      url: getPropertyPhotoPublicUrl(row.storage_path)
    }
  });
}
