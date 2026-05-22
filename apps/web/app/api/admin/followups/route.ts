import { parseFormData, redirectWithStatus, requireAdminRoute } from "@/lib/admin-api";
import { followupCreateSchema } from "@/lib/admin-schemas";
import { getServiceClientOrThrow } from "@/lib/server";

export async function POST(request: Request) {
  const auth = await requireAdminRoute();
  if (!auth.ok) return auth.response;

  const formData = await request.formData();
  const parsed = parseFormData(followupCreateSchema, formData);
  if (!parsed.success) {
    return redirectWithStatus(request, String(formData.get("redirect") ?? ""), "/admin/followups", "error", "validation");
  }
  const { lead_id: leadId, due_at: dueAt, note, redirect } = parsed.data;

  const supabase = getServiceClientOrThrow();
  const { error } = await supabase.from("followups").insert({
    lead_id: leadId,
    due_at: new Date(dueAt).toISOString(),
    note
  });

  if (error) {
    return redirectWithStatus(request, redirect, "/admin/followups", "error", "save");
  }

  await supabase.from("activities").insert({
    action: "Followup Scheduled",
    entity_type: "followup",
    description: `${auth.admin.email} scheduled followup for ${new Date(dueAt).toLocaleString("en-IN")}`
  });

  return redirectWithStatus(request, redirect, "/admin/followups", "ok");
}
