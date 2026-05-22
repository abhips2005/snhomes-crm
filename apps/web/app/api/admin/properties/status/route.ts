import { parseFormData, redirectWithStatus, requireAdminRoute } from "@/lib/admin-api";
import { propertyStatusUpdateSchema } from "@/lib/admin-schemas";
import { getServiceClientOrThrow } from "@/lib/server";

export async function POST(request: Request) {
  const auth = await requireAdminRoute();
  if (!auth.ok) return auth.response;

  const formData = await request.formData();
  const parsed = parseFormData(propertyStatusUpdateSchema, formData);
  if (!parsed.success) {
    return redirectWithStatus(request, String(formData.get("redirect") ?? ""), "/admin/properties", "error", "validation");
  }
  const { property_id: propertyId, status, redirect } = parsed.data;

  const supabase = getServiceClientOrThrow();
  const { error } = await supabase.from("properties").update({ status }).eq("id", propertyId);
  if (error) {
    return redirectWithStatus(request, redirect, "/admin/properties", "error", "save");
  }

  await supabase.from("activities").insert({
    action: "Property Updated",
    entity_type: "property",
    entity_id: propertyId,
    description: `${auth.admin.email} changed property status to ${status}`
  });

  return redirectWithStatus(request, redirect, "/admin/properties", "ok");
}
