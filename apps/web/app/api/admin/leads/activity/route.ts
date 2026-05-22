import { NextResponse } from "next/server";
import { redirectWithStatus, requireAdminRoute } from "@/lib/admin-api";
import { leadActivitySchema } from "@/lib/admin-schemas";
import { getServiceClientOrThrow } from "@/lib/server";

async function parseBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const json = await request.json();
    return leadActivitySchema.safeParse(json);
  }
  const formData = await request.formData();
  const raw: Record<string, string> = {};
  formData.forEach((value, key) => {
    raw[key] = String(value);
  });
  return leadActivitySchema.safeParse(raw);
}

export async function POST(request: Request) {
  const auth = await requireAdminRoute();
  if (!auth.ok) return auth.response;

  const parsed = await parseBody(request);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid activity payload" }, { status: 400 });
  }

  const { lead_id: leadId, channel, redirect } = parsed.data;
  const supabase = getServiceClientOrThrow();
  const { data: lead, error: leadError } = await supabase.from("leads").select("request_id, name, phone").eq("id", leadId).single();
  if (leadError || !lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const when = new Date().toLocaleString("en-IN");
  const label = channel === "call" ? "Call initiated" : "WhatsApp opened";
  const description = `${label} for ${lead.request_id} (${lead.name}) at ${when}`;

  const { error } = await supabase.from("activities").insert({
    action: channel === "call" ? "Lead Call" : "Lead WhatsApp",
    entity_type: "lead",
    entity_id: leadId,
    description
  });

  if (error) {
    if ((request.headers.get("content-type") ?? "").includes("application/json")) {
      return NextResponse.json({ error: "Could not log activity" }, { status: 500 });
    }
    return redirectWithStatus(request, redirect, "/admin/leads", "error", "save");
  }

  if ((request.headers.get("content-type") ?? "").includes("application/json")) {
    return NextResponse.json({ ok: true, description, when });
  }

  return redirectWithStatus(request, redirect, "/admin/leads", "ok");
}
