import { buyLeadSchema } from "@snh/types";
import { NextResponse } from "next/server";
import { formatRequestId, getServiceClientOrThrow } from "@/lib/server";

export async function POST(request: Request) {
  const payload = buyLeadSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: payload.error.issues[0]?.message ?? "Invalid lead" }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getServiceClientOrThrow();
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Supabase is not configured" }, { status: 500 });
  }

  const { count } = await supabase.from("leads").select("id", { count: "exact", head: true });
  const request_id = formatRequestId((count ?? 0) + 1);
  const values = payload.data;
  const { error } = await supabase.from("leads").insert({
    request_id,
    name: values.name,
    phone: values.phone,
    type: "buyer",
    district: values.district,
    locality: values.locality,
    pincode: values.preferred_pincode || null,
    property_type: values.property_type,
    budget_min: values.budget_min,
    budget_max: values.budget_max,
    source: "Website",
    status: "New",
    request_status: "Received",
    priority: values.timeline === "immediately" ? "Hot" : "Warm",
    notes: values.notes || null
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("activities").insert({ action: "Lead Created", entity_type: "lead", description: `${request_id} created from buy/rent form` });
  return NextResponse.json({ request_id });
}
