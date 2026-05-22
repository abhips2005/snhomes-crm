import { rankLeadsForProperty, rankPropertiesForLead } from "@/lib/admin-matches";
import { isRequirementLead } from "@/lib/matching";
import { getServiceClientOrThrow } from "@/lib/server";

const PROPERTY_SELECT =
  "id, property_id, seller_lead_id, type, status, price, district, locality, area, pincode, description, bedrooms, bathrooms, sqft, land_area, additional_notes, created_at, updated_at";

export type LeadRow = {
  id: string;
  request_id: string;
  name: string;
  phone: string;
  type: "buyer" | "seller" | "tenant" | "landlord";
  district: string;
  locality: string;
  pincode: string | null;
  property_type: string;
  budget_min: number | null;
  budget_max: number | null;
  status: string;
  request_status: string;
  priority: string;
  notes: string | null;
  source: string;
  next_followup_at: string | null;
  created_at: string;
};

export type PropertyRow = {
  id: string;
  property_id: string;
  seller_lead_id: string | null;
  type: string;
  status: string;
  price: number;
  district: string;
  locality: string;
  area: string | null;
  pincode: string;
  description: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  land_area: string | null;
  additional_notes: string | null;
  created_at: string;
  updated_at?: string;
  seller?: { name: string; request_id?: string } | null;
};

export type LeadPropertyMatch = PropertyRow & {
  score: number;
  match_status: string | null;
  source: "saved" | "suggested";
};

export function formatCurrency(value: number | null | undefined) {
  if (typeof value !== "number") return "N/A";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
}

export function formatBudgetRange(min: number | null, max: number | null) {
  if (typeof min === "number" && typeof max === "number") return `INR ${formatCurrency(min)} - ${formatCurrency(max)}`;
  if (typeof max === "number") return `Up to INR ${formatCurrency(max)}`;
  if (typeof min === "number") return `From INR ${formatCurrency(min)}`;
  return "N/A";
}

export async function getLeads(limit = 100) {
  const supabase = getServiceClientOrThrow();
  const { data, error } = await supabase
    .from("leads")
    .select("id, request_id, name, phone, type, district, locality, pincode, property_type, budget_min, budget_max, status, request_status, priority, notes, source, next_followup_at, created_at")
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as LeadRow[];
}

export async function getProperties(limit = 100) {
  const supabase = getServiceClientOrThrow();
  const { data, error } = await supabase
    .from("properties")
    .select(`${PROPERTY_SELECT}, seller:leads(name, request_id)`)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).map((item) => ({
    ...item,
    seller: Array.isArray(item.seller) ? (item.seller[0] ?? null) : (item.seller ?? null)
  })) as PropertyRow[];
}

export async function getActivities(limit = 12) {
  const supabase = getServiceClientOrThrow();
  const { data, error } = await supabase
    .from("activities")
    .select("id, action, entity_type, entity_id, description, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getActivitiesForLead(leadId: string, requestId: string, limit = 30) {
  const supabase = getServiceClientOrThrow();
  const { data, error } = await supabase
    .from("activities")
    .select("id, action, entity_type, entity_id, description, created_at")
    .or(`entity_id.eq.${leadId},description.ilike.%${requestId}%`)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPropertyById(id: string) {
  const supabase = getServiceClientOrThrow();
  const { data, error } = await supabase
    .from("properties")
    .select(`${PROPERTY_SELECT}, seller:leads(name, request_id, phone)`)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    ...data,
    seller: Array.isArray(data.seller) ? (data.seller[0] ?? null) : (data.seller ?? null)
  } as PropertyRow;
}

export async function getLeadPropertyMatches(lead: LeadRow, properties: PropertyRow[]) {
  const supabase = getServiceClientOrThrow();
  const propertyById = new Map(properties.map((property) => [property.id, property]));
  const { data: savedRows, error } = await supabase
    .from("matches")
    .select("score, status, property_id")
    .eq("lead_id", lead.id)
    .neq("status", "Rejected");
  if (error) throw new Error(error.message);

  const merged = new Map<string, LeadPropertyMatch>();

  for (const row of savedRows ?? []) {
    const property = propertyById.get(row.property_id);
    if (!property) continue;
    merged.set(property.id, {
      ...property,
      score: row.score,
      match_status: row.status,
      source: "saved"
    });
  }

  const { data: visitRows } = await supabase.from("visits").select("property_id").eq("lead_id", lead.id).in("status", ["Scheduled", "Completed"]);
  for (const visit of visitRows ?? []) {
    const property = propertyById.get(visit.property_id);
    if (!property || merged.has(property.id)) continue;
    merged.set(property.id, {
      ...property,
      score: 100,
      match_status: "Matched",
      source: "saved"
    });
  }

  if (isRequirementLead(lead.type)) {
    const suggested = rankPropertiesForLead(lead, properties, { minScore: 1, limit: 12 });
    for (const item of suggested) {
      const property = propertyById.get(item.id);
      if (!property || merged.has(property.id)) continue;
      merged.set(property.id, {
        ...property,
        score: item.score,
        match_status: null,
        source: "suggested"
      });
    }
  } else {
    for (const item of properties.filter((property) => property.seller_lead_id === lead.id)) {
      merged.set(item.id, {
        ...item,
        score: 0,
        match_status: null,
        source: "saved"
      });
    }
  }

  return Array.from(merged.values()).sort((a, b) => b.score - a.score);
}

export async function getDashboardStats() {
  const supabase = getServiceClientOrThrow();
  const [leadsResult, propertiesResult, matchesResult, visitsResult] = await Promise.all([
    supabase.from("leads").select("id, status, priority, created_at"),
    supabase.from("properties").select("id, status"),
    supabase.from("matches").select("id"),
    supabase.from("visits").select("id, status")
  ]);

  if (leadsResult.error) throw new Error(leadsResult.error.message);
  if (propertiesResult.error) throw new Error(propertiesResult.error.message);
  if (matchesResult.error) throw new Error(matchesResult.error.message);
  if (visitsResult.error) throw new Error(visitsResult.error.message);

  const leads = leadsResult.data ?? [];
  const properties = propertiesResult.data ?? [];
  const matches = matchesResult.data ?? [];
  const visits = visitsResult.data ?? [];
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;

  return [
    ["New Leads", String(leads.filter((lead) => new Date(lead.created_at).getTime() >= dayAgo).length)],
    ["Open Leads", String(leads.filter((lead) => lead.status !== "Closed" && lead.status !== "Lost").length)],
    ["Hot Leads", String(leads.filter((lead) => lead.priority === "Hot").length)],
    ["Properties", String(properties.length)],
    ["Matches", String(matches.length)],
    ["Visits", String(visits.length)],
    ["Closed Deals", String(leads.filter((lead) => lead.status === "Closed").length)]
  ] as const;
}

export async function getDashboardCharts() {
  const supabase = getServiceClientOrThrow();
  const [leadsResult, propertiesResult] = await Promise.all([
    supabase.from("leads").select("source, district, status"),
    supabase.from("properties").select("district")
  ]);

  if (leadsResult.error) throw new Error(leadsResult.error.message);
  if (propertiesResult.error) throw new Error(propertiesResult.error.message);

  const leads = leadsResult.data ?? [];
  const properties = propertiesResult.data ?? [];

  const sourceCounts = new Map<string, number>();
  const districtDemand = new Map<string, number>();
  const statusCounts = new Map<string, number>();

  for (const lead of leads) {
    sourceCounts.set(lead.source ?? "Unknown", (sourceCounts.get(lead.source ?? "Unknown") ?? 0) + 1);
    districtDemand.set(lead.district ?? "Unknown", (districtDemand.get(lead.district ?? "Unknown") ?? 0) + 1);
    statusCounts.set(lead.status ?? "Unknown", (statusCounts.get(lead.status ?? "Unknown") ?? 0) + 1);
  }

  for (const property of properties) {
    districtDemand.set(property.district ?? "Unknown", (districtDemand.get(property.district ?? "Unknown") ?? 0) + 1);
  }

  const toBars = (counts: Map<string, number>) =>
    Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([, count]) => count);

  return {
    source: toBars(sourceCounts),
    district: toBars(districtDemand),
    status: toBars(statusCounts)
  };
}

export async function getMatchingSnapshot(propertyId?: string) {
  const [leads, properties] = await Promise.all([getLeads(200), getProperties(200)]);
  const property = propertyId ? properties.find((item) => item.id === propertyId || item.property_id === propertyId) ?? null : properties[0] ?? null;
  if (!property) return { property: null, leadCandidates: [] as Array<LeadRow & { score: number }> };

  const leadCandidates = rankLeadsForProperty(property, leads).slice(0, 12);
  return { property, leadCandidates };
}

export async function getVisits() {
  const supabase = getServiceClientOrThrow();
  const { data, error } = await supabase
    .from("visits")
    .select("id, status, scheduled_at, lead:leads(name, phone), property:properties(property_id, locality, district)")
    .order("scheduled_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((item) => ({
    ...item,
    lead: Array.isArray(item.lead) ? (item.lead[0] ?? null) : item.lead,
    property: Array.isArray(item.property) ? (item.property[0] ?? null) : item.property
  }));
}

export async function getFollowups() {
  const supabase = getServiceClientOrThrow();
  const { data, error } = await supabase
    .from("followups")
    .select("id, due_at, note, outcome, completed_at, lead:leads(name, phone, request_id)")
    .order("due_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((item) => ({
    ...item,
    lead: Array.isArray(item.lead) ? (item.lead[0] ?? null) : item.lead
  }));
}

export async function getSettings() {
  const supabase = getServiceClientOrThrow();
  const { data, error } = await supabase.from("settings").select("key, value, updated_at").order("key");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAnalyticsSnapshot() {
  const [leads, properties, visits, followups] = await Promise.all([
    getLeads(500),
    getProperties(500),
    getVisits(),
    getFollowups()
  ]);
  const leadCount = leads.length;
  const closedCount = leads.filter((lead) => lead.status === "Closed").length;
  const conversion = leadCount ? ((closedCount / leadCount) * 100).toFixed(1) : "0.0";
  const completedVisits = visits.filter((visit) => visit.status === "Completed").length;
  const overdueFollowups = followups.filter((followup) => !followup.completed_at && new Date(followup.due_at).getTime() < Date.now()).length;
  const liveProperties = properties.filter((property) => property.status === "Live" || property.status === "Verified").length;

  return [
    ["Lead Count", String(leadCount)],
    ["Conversion", `${conversion}%`],
    ["Completed Visits", String(completedVisits)],
    ["Overdue Followups", String(overdueFollowups)],
    ["Live Listings", String(liveProperties)]
  ] as const;
}
