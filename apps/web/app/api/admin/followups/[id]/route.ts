import { parseFormData, redirectWithStatus, requireAdminRoute } from "@/lib/admin-api";
import { followupUpdateSchema } from "@/lib/admin-schemas";
import { getServiceClientOrThrow } from "@/lib/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRoute();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const formData = await request.formData();
  const parsed = parseFormData(followupUpdateSchema, formData);
  if (!parsed.success) {
    return redirectWithStatus(request, String(formData.get("redirect") ?? ""), "/admin/followups", "error", "validation");
  }
  const outcome = (parsed.data.outcome ?? "").trim();
  const complete = parsed.data.complete === "1";
  const redirect = parsed.data.redirect;

  const payload: { outcome?: string; completed_at?: string | null } = {};
  if (outcome) payload.outcome = outcome;
  payload.completed_at = complete ? new Date().toISOString() : null;

  const supabase = getServiceClientOrThrow();
  const { error } = await supabase.from("followups").update(payload).eq("id", id);
  if (error) {
    return redirectWithStatus(request, redirect, "/admin/followups", "error", "save");
  }

  await supabase.from("activities").insert({
    action: "Followup Updated",
    entity_type: "followup",
    entity_id: id,
    description: `${auth.admin.email} ${complete ? "completed" : "updated"} followup${outcome ? ` with ${outcome}` : ""}`
  });

  return redirectWithStatus(request, redirect, "/admin/followups", "ok");
}
