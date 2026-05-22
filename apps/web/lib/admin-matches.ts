import { calculateMatchScore, isOwnPropertyListing, isRequirementLead, scorePropertyForLead } from "@/lib/matching";
import { getServiceClientOrThrow } from "@/lib/server";

type LeadForMatch = {
  id: string;
  request_id?: string;
  name?: string;
  type: string;
  district: string;
  locality: string;
  pincode: string | null;
  property_type: string;
  budget_min: number | null;
  budget_max: number | null;
};

type PropertyForMatch = {
  id: string;
  property_id: string;
  seller_lead_id: string | null;
  type: string;
  status: string;
  price: number;
  district: string;
  locality: string;
  pincode: string;
};

export async function upsertPropertyMatch({
  leadId,
  propertyId,
  score,
  status = "Matched"
}: {
  leadId: string;
  propertyId: string;
  score: number;
  status?: "Saved" | "Matched" | "Sent" | "Rejected";
}) {
  const supabase = getServiceClientOrThrow();
  const { data: property } = await supabase.from("properties").select("seller_lead_id").eq("id", propertyId).single();
  if (property && isOwnPropertyListing(leadId, property.seller_lead_id)) {
    return { error: new Error("Cannot match a property to the lead who posted it.") };
  }

  return supabase.from("matches").upsert(
    { lead_id: leadId, property_id: propertyId, score, status },
    { onConflict: "lead_id,property_id" }
  );
}

export async function ensureVisitMatch({
  leadId,
  propertyId,
  lead,
  property
}: {
  leadId: string;
  propertyId: string;
  lead: LeadForMatch;
  property: PropertyForMatch;
}) {
  if (!isRequirementLead(lead.type) || isOwnPropertyListing(leadId, property.seller_lead_id)) {
    return null;
  }

  const score =
    scorePropertyForLead(
      {
        id: lead.id,
        district: lead.district,
        locality: lead.locality,
        pincode: lead.pincode,
        property_type: lead.property_type,
        budget_min: lead.budget_min,
        budget_max: lead.budget_max,
        type: lead.type
      },
      {
        id: property.id,
        district: property.district,
        locality: property.locality,
        pincode: property.pincode,
        type: property.type,
        price: property.price,
        seller_lead_id: property.seller_lead_id
      }
    ) ?? 0;

  const { data: existing } = await getServiceClientOrThrow()
    .from("matches")
    .select("id, status")
    .eq("lead_id", leadId)
    .eq("property_id", propertyId)
    .maybeSingle();

  if (existing && existing.status !== "Rejected") {
    return existing;
  }

  const result = await upsertPropertyMatch({ leadId, propertyId, score: Math.max(score, 1), status: "Matched" });
  if (result.error) return null;
  return result;
}

export function rankLeadsForProperty<T extends LeadForMatch>(property: PropertyForMatch, leads: T[]) {
  return leads
    .filter((lead) => isRequirementLead(lead.type))
    .filter((lead) => !isOwnPropertyListing(lead.id, property.seller_lead_id))
    .map((lead) => ({
      ...lead,
      score:
        calculateMatchScore({
          lead: {
            id: lead.id,
            district: lead.district,
            locality: lead.locality,
            pincode: lead.pincode,
            property_type: lead.property_type,
            budget_min: lead.budget_min,
            budget_max: lead.budget_max,
            type: lead.type
          },
          property: {
            id: property.id,
            district: property.district,
            locality: property.locality,
            pincode: property.pincode,
            type: property.type,
            price: property.price,
            seller_lead_id: property.seller_lead_id
          }
        }) ?? 0
    }))
    .sort((a, b) => b.score - a.score);
}

export function rankPropertiesForLead(
  lead: LeadForMatch,
  properties: PropertyForMatch[],
  options?: { minScore?: number; limit?: number }
) {
  const minScore = options?.minScore ?? 1;
  const limit = options?.limit ?? 8;

  return properties
    .filter((property) => !isOwnPropertyListing(lead.id, property.seller_lead_id))
    .map((property) => ({
      ...property,
      score:
        calculateMatchScore({
          lead: {
            id: lead.id,
            district: lead.district,
            locality: lead.locality,
            pincode: lead.pincode,
            property_type: lead.property_type,
            budget_min: lead.budget_min,
            budget_max: lead.budget_max,
            type: lead.type
          },
          property: {
            id: property.id,
            district: property.district,
            locality: property.locality,
            pincode: property.pincode,
            type: property.type,
            price: property.price,
            seller_lead_id: property.seller_lead_id
          }
        }) ?? 0
    }))
    .filter((item) => item.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
