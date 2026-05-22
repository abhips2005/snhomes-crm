import { parseFormData, redirectWithStatus, requireAdminRoute } from "@/lib/admin-api";
import { propertyUpdateSchema } from "@/lib/admin-schemas";
import { getServiceClientOrThrow } from "@/lib/server";

function optionalNumber(value: string | undefined) {
  if (value === undefined) return undefined;
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function optionalText(value: string | undefined) {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export async function POST(request: Request) {
  const auth = await requireAdminRoute();
  if (!auth.ok) return auth.response;

  const formData = await request.formData();
  const parsed = parseFormData(propertyUpdateSchema, formData);
  if (!parsed.success) {
    return redirectWithStatus(request, String(formData.get("redirect") ?? ""), "/admin/properties", "error", "validation");
  }

  const { property_id: propertyId, status, bedrooms, bathrooms, sqft, land_area, additional_notes, redirect } = parsed.data;
  const updates: Record<string, string | number | null> = {
    updated_at: new Date().toISOString()
  };

  if (status) updates.status = status;
  if (bedrooms !== undefined) {
    const value = optionalNumber(bedrooms);
    if (value !== undefined) updates.bedrooms = value;
  }
  if (bathrooms !== undefined) {
    const value = optionalNumber(bathrooms);
    if (value !== undefined) updates.bathrooms = value;
  }
  if (sqft !== undefined) {
    const value = optionalNumber(sqft);
    if (value !== undefined) updates.sqft = value;
  }
  if (land_area !== undefined) {
    const value = optionalText(land_area);
    if (value !== undefined) updates.land_area = value;
  }
  if (additional_notes !== undefined) {
    const value = optionalText(additional_notes);
    if (value !== undefined) updates.additional_notes = value;
  }

  const supabase = getServiceClientOrThrow();
  const { error } = await supabase.from("properties").update(updates).eq("id", propertyId);
  if (error) {
    return redirectWithStatus(request, redirect, "/admin/properties", "error", "save");
  }

  await supabase.from("activities").insert({
    action: "Property Updated",
    entity_type: "property",
    entity_id: propertyId,
    description: `${auth.admin.email} updated property details`
  });

  const fallback = `/admin/properties/${propertyId}`;
  return redirectWithStatus(request, redirect ?? fallback, fallback, "ok");
}
