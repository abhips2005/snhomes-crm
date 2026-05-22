import { trackRequestSchema } from "@snh/types";
import { NextResponse } from "next/server";
import { getServiceClientOrThrow } from "@/lib/server";

export async function POST(request: Request) {
  const payload = trackRequestSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: payload.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getServiceClientOrThrow();
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Supabase is not configured" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("leads")
    .select("request_id, request_status, name, type")
    .eq("phone", payload.data.phone)
    .eq("request_id", payload.data.request_id.toUpperCase())
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "No matching request found" }, { status: 404 });
  }

  return NextResponse.json({
    request_id: data.request_id,
    status: data.request_status,
    name: data.name,
    type: data.type
  });
}
