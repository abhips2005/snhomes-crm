export const DISTRICTS = [
  "Thiruvananthapuram",
  "Kollam",
  "Pathanamthitta",
  "Alappuzha",
  "Kottayam",
  "Idukki",
  "Ernakulam",
  "Thrissur",
  "Palakkad",
  "Malappuram",
  "Kozhikode",
  "Wayanad",
  "Kannur",
  "Kasaragod"
] as const;

export const PROPERTY_TYPES = ["house", "villa", "plot", "apartment", "commercial"] as const;
export const TIMELINES = ["immediately", "1 month", "3 months", "just exploring"] as const;

export const REQUEST_STATUSES = [
  "Received",
  "Reviewing",
  "Matching",
  "Contacted",
  "Site Visit",
  "Closed"
] as const;

export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Qualified",
  "Matching",
  "Shortlisted",
  "Site Visit",
  "Negotiation",
  "Closed",
  "Lost"
] as const;

export const PROPERTY_STATUSES = ["Draft", "Pending", "Verified", "Live", "Sold", "Inactive"] as const;
export const PRIORITIES = ["Cold", "Warm", "Hot"] as const;
export const VISIT_STATUSES = ["Scheduled", "Completed", "Cancelled"] as const;
export const FOLLOWUP_OUTCOMES = ["No Answer", "Interested", "Later", "Visit Scheduled", "Closed"] as const;
