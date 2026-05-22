type MatchLead = {
  id?: string;
  district: string;
  locality: string;
  pincode?: string | null;
  property_type: string;
  budget_min?: number | null;
  budget_max?: number | null;
  type?: string;
};

type MatchProperty = {
  id?: string;
  district: string;
  locality: string;
  pincode?: string | null;
  type: string;
  price: number;
  seller_lead_id?: string | null;
};

export function isRequirementLead(type: string) {
  return type === "buyer" || type === "tenant";
}

/** Do not match a listing to the lead who posted that property. */
export function isOwnPropertyListing(leadId: string | undefined, sellerLeadId: string | null | undefined) {
  if (!leadId || !sellerLeadId) return false;
  return sellerLeadId === leadId;
}

export function calculateMatchScore({
  lead,
  property
}: {
  lead: MatchLead;
  property: MatchProperty;
}) {
  let score = 0;
  if (lead.district === property.district) score += 30;
  if (lead.locality.toLowerCase() === property.locality.toLowerCase()) score += 25;
  if (lead.pincode && lead.pincode === property.pincode) score += 20;
  if (lead.property_type === property.type) score += 15;
  if (
    typeof lead.budget_min === "number" &&
    typeof lead.budget_max === "number" &&
    property.price >= lead.budget_min &&
    property.price <= lead.budget_max
  ) {
    score += 10;
  }

  return Math.min(score, 100);
}

export function scoreLeadForProperty(lead: MatchLead, property: MatchProperty) {
  if (lead.type && !isRequirementLead(lead.type)) return null;
  if (isOwnPropertyListing(lead.id, property.seller_lead_id)) return null;
  return calculateMatchScore({ lead, property });
}

export function scorePropertyForLead(lead: MatchLead, property: MatchProperty) {
  if (lead.type && !isRequirementLead(lead.type)) return null;
  if (isOwnPropertyListing(lead.id, property.seller_lead_id)) return null;
  return calculateMatchScore({ lead, property });
}
