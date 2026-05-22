import { sellLeadSchema } from "@snh/types";
import { NextResponse } from "next/server";
import { formatRequestId, getServiceClientOrThrow } from "@/lib/server";

export async function POST(request: Request) {
  const payload = sellLeadSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: payload.error.issues[0]?.message ?? "Invalid property" }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getServiceClientOrThrow();
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Supabase is not configured" }, { status: 500 });
  }

  const [{ count: leadCount }, { count: propertyCount }] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase.from("properties").select("id", { count: "exact", head: true })
  ]);
  const request_id = formatRequestId((leadCount ?? 0) + 1);
  const property_id = `PROP-${((propertyCount ?? 0) + 1).toString().padStart(4, "0")}`;
  const values = payload.data;

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .insert({
      request_id,
      name: values.name,
      phone: values.phone,
      type: "seller",
      district: values.district,
      locality: values.locality,
      pincode: values.pincode,
      property_type: values.property_type,
      source: "Website",
      status: "New",
      request_status: "Received",
      priority: "Warm",
      notes: values.notes
    })
    .select("id")
    .single();

  if (leadError) return NextResponse.json({ error: leadError.message }, { status: 500 });

  const { error: propertyError } = await supabase.from("properties").insert({
    property_id,
    seller_lead_id: lead.id,
    type: values.property_type,
    status: "Draft",
    price: values.asking_price,
    district: values.district,
    locality: values.locality,
    pincode: values.pincode,
    description: values.notes
  });

  if (propertyError) return NextResponse.json({ error: propertyError.message }, { status: 500 });
  await supabase.from("activities").insert({ action: "Property Added", entity_type: "property", description: `${property_id} drafted from sell form` });
  return NextResponse.json({ request_id });
}
