import { NextResponse } from "next/server";
import { requireAdminRoute } from "@/lib/admin-api";
import { PROPERTY_PHOTOS_BUCKET } from "@/lib/property-photos";
import { getServiceClientOrThrow } from "@/lib/server";

export const runtime = "nodejs";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRoute();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const supabase = getServiceClientOrThrow();

  const { data: photo, error: photoError } = await supabase
    .from("property_photos")
    .select("id, property_id, storage_path")
    .eq("id", id)
    .maybeSingle();

  if (photoError || !photo) {
    return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  }

  await supabase.storage.from(PROPERTY_PHOTOS_BUCKET).remove([photo.storage_path]);
  const { error: deleteError } = await supabase.from("property_photos").delete().eq("id", id);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  await supabase.from("activities").insert({
    action: "Property Photo Removed",
    entity_type: "property",
    entity_id: photo.property_id,
    description: `${auth.admin.email} removed a property photo`
  });

  return NextResponse.json({ ok: true });
}
