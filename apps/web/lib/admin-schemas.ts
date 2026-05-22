import { z } from "zod";

const leadStatus = z.enum(["New", "Contacted", "Qualified", "Matching", "Shortlisted", "Site Visit", "Negotiation", "Closed", "Lost"]);
const requestStatus = z.enum(["Received", "Reviewing", "Matching", "Contacted", "Site Visit", "Closed"]);
const leadPriority = z.enum(["Cold", "Warm", "Hot"]);
const propertyStatus = z.enum(["Draft", "Pending", "Verified", "Live", "Sold", "Inactive"]);

export const propertyStatusUpdateSchema = z.object({
  property_id: z.string().uuid(),
  status: propertyStatus,
  redirect: z.string().optional()
});

export const propertyUpdateSchema = z.object({
  property_id: z.string().uuid(),
  status: propertyStatus.optional(),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  sqft: z.string().optional(),
  land_area: z.string().trim().max(120).optional(),
  additional_notes: z.string().trim().max(4000).optional(),
  redirect: z.string().optional()
});

export const matchUpsertSchema = z.object({
  lead_id: z.string().uuid(),
  property_id: z.string().uuid(),
  status: z.enum(["Saved", "Matched", "Sent", "Rejected"]),
  score: z.coerce.number().int().min(0).max(100),
  redirect: z.string().optional()
});

export const leadUpdateSchema = z.object({
  lead_id: z.string().uuid(),
  status: leadStatus.optional(),
  request_status: requestStatus.optional(),
  priority: leadPriority.optional(),
  redirect: z.string().optional()
});

export const leadActivitySchema = z.object({
  lead_id: z.string().uuid(),
  channel: z.enum(["call", "whatsapp"]),
  redirect: z.string().optional()
});

export const followupCreateSchema = z.object({
  lead_id: z.string().uuid(),
  due_at: z.string().datetime({ offset: true }).or(z.string().min(16)),
  note: z.string().trim().min(2).max(1200),
  redirect: z.string().optional()
});

export const followupUpdateSchema = z.object({
  outcome: z.enum(["No Answer", "Interested", "Later", "Visit Scheduled", "Closed"]).optional().or(z.literal("")),
  complete: z.enum(["0", "1"]),
  redirect: z.string().optional()
});

export const visitCreateSchema = z.object({
  lead_id: z.string().uuid(),
  property_id: z.string().uuid(),
  scheduled_at: z.string().datetime({ offset: true }).or(z.string().min(16)),
  redirect: z.string().optional()
});

export const visitUpdateSchema = z.object({
  status: z.enum(["Scheduled", "Completed", "Cancelled"]),
  redirect: z.string().optional()
});

export const settingUpdateSchema = z.object({
  key: z.string().trim().min(1),
  value: z.string().trim().min(2),
  redirect: z.string().optional()
});
