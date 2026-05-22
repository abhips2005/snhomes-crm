import { parseFormData, redirectWithStatus, requireAdminRoute } from "@/lib/admin-api";
import { visitUpdateSchema } from "@/lib/admin-schemas";
import { getServiceClientOrThrow } from "@/lib/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminRoute();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const formData = await request.formData();
  const parsed = parseFormData(visitUpdateSchema, formData);
  if (!parsed.success) {
    return redirectWithStatus(request, String(formData.get("redirect") ?? ""), "/admin/visits", "error", "validation");
  }
  const { status, redirect } = parsed.data;

  const supabase = getServiceClientOrThrow();
  const { error } = await supabase.from("visits").update({ status }).eq("id", id);
  if (error) {
    return redirectWithStatus(request, redirect, "/admin/visits", "error", "save");
  }

  await supabase.from("activities").insert({
    action: "Visit Updated",
    entity_type: "visit",
    entity_id: id,
    description: `${auth.admin.email} marked visit as ${status}`
  });

  return redirectWithStatus(request, redirect, "/admin/visits", "ok");
}
