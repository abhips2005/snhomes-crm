import { parseFormData, redirectWithStatus, requireAdminRoute } from "@/lib/admin-api";
import { settingUpdateSchema } from "@/lib/admin-schemas";
import { getServiceClientOrThrow } from "@/lib/server";

export async function POST(request: Request) {
  const auth = await requireAdminRoute();
  if (!auth.ok) return auth.response;

  const formData = await request.formData();
  const parsed = parseFormData(settingUpdateSchema, formData);
  if (!parsed.success) {
    return redirectWithStatus(request, String(formData.get("redirect") ?? ""), "/admin/settings", "error", "validation");
  }
  const { key, value: valueText, redirect } = parsed.data;

  let value: unknown;
  try {
    value = JSON.parse(valueText);
  } catch {
    return redirectWithStatus(request, redirect, "/admin/settings", "error", "json");
  }

  const supabase = getServiceClientOrThrow();
  const { error } = await supabase.from("settings").upsert({ key, value }, { onConflict: "key" });
  if (error) {
    return redirectWithStatus(request, redirect, "/admin/settings", "error", "save");
  }

  await supabase.from("activities").insert({
    action: "Setting Updated",
    entity_type: "setting",
    description: `${auth.admin.email} updated setting '${key}'`
  });

  return redirectWithStatus(request, redirect, "/admin/settings", "ok");
}
