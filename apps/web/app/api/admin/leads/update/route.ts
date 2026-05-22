import { NextResponse } from "next/server";
import { redirectWithStatus, requireAdminRoute } from "@/lib/admin-api";
import { leadUpdateSchema } from "@/lib/admin-schemas";
import { getServiceClientOrThrow } from "@/lib/server";

async function parseBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const json = await request.json();
    return leadUpdateSchema.safeParse(json);
  }
  const formData = await request.formData();
  const raw: Record<string, string> = {};
  formData.forEach((value, key) => {
    raw[key] = String(value);
  });
  return leadUpdateSchema.safeParse(raw);
}

export async function POST(request: Request) {
  const auth = await requireAdminRoute();
  if (!auth.ok) return auth.response;

  const parsed = await parseBody(request);
  if (!parsed.success) {
    if ((request.headers.get("content-type") ?? "").includes("application/json")) {
      return NextResponse.json({ error: "Invalid lead update" }, { status: 400 });
    }
    return redirectWithStatus(request, "/admin/leads", "/admin/leads", "error", "validation");
  }

  const { lead_id: leadId, status, request_status: requestStatus, priority, redirect } = parsed.data;
  const updates: Record<string, string> = {};
  if (status) updates.status = status;
  if (requestStatus) updates.request_status = requestStatus;
  if (priority) updates.priority = priority;

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const supabase = getServiceClientOrThrow();
  const { data: lead, error } = await supabase.from("leads").update(updates).eq("id", leadId).select("request_id").single();

  if (error || !lead) {
    if ((request.headers.get("content-type") ?? "").includes("application/json")) {
      return NextResponse.json({ error: "Could not update lead" }, { status: 500 });
    }
    return redirectWithStatus(request, redirect, "/admin/leads", "error", "save");
  }

  await supabase.from("activities").insert({
    action: "Lead Updated",
    entity_type: "lead",
    entity_id: leadId,
    description: `${auth.admin.email} updated ${lead.request_id}: ${Object.entries(updates)
      .map(([key, value]) => `${key} → ${value}`)
      .join(", ")}`
  });

  if ((request.headers.get("content-type") ?? "").includes("application/json")) {
    return NextResponse.json({ ok: true });
  }

  return redirectWithStatus(request, redirect, "/admin/leads", "ok");
}
