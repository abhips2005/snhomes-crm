import { parseFormData, redirectWithStatus, requireAdminRoute } from "@/lib/admin-api";
import { ensureVisitMatch } from "@/lib/admin-matches";
import { visitCreateSchema } from "@/lib/admin-schemas";
import { getServiceClientOrThrow } from "@/lib/server";

export async function POST(request: Request) {
  const auth = await requireAdminRoute();
  if (!auth.ok) return auth.response;

  const formData = await request.formData();
  const parsed = parseFormData(visitCreateSchema, formData);
  if (!parsed.success) {
    return redirectWithStatus(request, String(formData.get("redirect") ?? ""), "/admin/visits", "error", "validation");
  }
  const { lead_id: leadId, property_id: propertyId, scheduled_at: scheduledAt, redirect } = parsed.data;

  const supabase = getServiceClientOrThrow();
  const { error } = await supabase.from("visits").insert({
    lead_id: leadId,
    property_id: propertyId,
    scheduled_at: new Date(scheduledAt).toISOString(),
    status: "Scheduled"
  });

  if (error) {
    return redirectWithStatus(request, redirect, "/admin/visits", "error", "save");
  }

  const [{ data: lead }, { data: property }] = await Promise.all([
    supabase
      .from("leads")
      .select("id, request_id, name, type, district, locality, pincode, property_type, budget_min, budget_max")
      .eq("id", leadId)
      .single(),
    supabase
      .from("properties")
      .select("id, property_id, seller_lead_id, type, status, price, district, locality, pincode")
      .eq("id", propertyId)
      .single()
  ]);

  if (lead && property) {
    await ensureVisitMatch({ leadId, propertyId, lead, property });
  }

  await supabase.from("activities").insert({
    action: "Visit Scheduled",
    entity_type: "visit",
    description: `${auth.admin.email} scheduled visit for ${new Date(scheduledAt).toLocaleString("en-IN")}`
  });

  return redirectWithStatus(request, redirect, "/admin/visits", "ok");
}
