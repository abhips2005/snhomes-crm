import { parseFormData, redirectWithStatus, requireAdminRoute } from "@/lib/admin-api";
import { upsertPropertyMatch } from "@/lib/admin-matches";
import { matchUpsertSchema } from "@/lib/admin-schemas";
import { getServiceClientOrThrow } from "@/lib/server";

export async function POST(request: Request) {
  const auth = await requireAdminRoute();
  if (!auth.ok) return auth.response;

  const formData = await request.formData();
  const parsed = parseFormData(matchUpsertSchema, formData);
  if (!parsed.success) {
    return redirectWithStatus(request, String(formData.get("redirect") ?? ""), "/admin/matching", "error", "validation");
  }
  const { lead_id: leadId, property_id: propertyId, status, score, redirect } = parsed.data;

  const { error } = await upsertPropertyMatch({ leadId, propertyId, score, status });
  if (error) {
    const detail = error.message.includes("posted") ? "own-listing" : "save";
    return redirectWithStatus(request, redirect, "/admin/matching", "error", detail);
  }

  const supabase = getServiceClientOrThrow();

  await supabase.from("activities").insert({
    action: "Match Updated",
    entity_type: "match",
    description: `${auth.admin.email} set match ${status.toLowerCase()} (score ${score})`
  });

  return redirectWithStatus(request, redirect, "/admin/matching", "ok");
}
