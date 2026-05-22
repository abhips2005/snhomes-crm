import { z } from "zod";
import {
  DISTRICTS,
  FOLLOWUP_OUTCOMES,
  LEAD_STATUSES,
  PRIORITIES,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  REQUEST_STATUSES,
  TIMELINES,
  VISIT_STATUSES
} from "./constants";

const phone = z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10 digit Indian mobile number");
const money = z.coerce.number().int().nonnegative();
const pincode = z.string().trim().regex(/^\d{6}$/, "Enter a valid 6 digit pincode");

export const buyLeadSchema = z
  .object({
    name: z.string().trim().min(2),
    phone,
    district: z.enum(DISTRICTS),
    locality: z.string().trim().min(2),
    property_type: z.enum(PROPERTY_TYPES),
    preferred_pincode: pincode.optional().or(z.literal("")),
    budget_min: money,
    budget_max: money,
    timeline: z.enum(TIMELINES),
    notes: z.string().trim().max(1000).optional().or(z.literal(""))
  })
  .refine((value) => value.budget_max >= value.budget_min, {
    message: "Maximum budget should be greater than or equal to minimum budget",
    path: ["budget_max"]
  });

export const sellLeadSchema = z.object({
  name: z.string().trim().min(2),
  phone,
  district: z.enum(DISTRICTS),
  locality: z.string().trim().min(2),
  pincode,
  property_type: z.enum(PROPERTY_TYPES),
  asking_price: money,
  notes: z.string().trim().min(10).max(1500)
});

export const trackRequestSchema = z.object({
  phone,
  request_id: z.string().trim().regex(/^SNH-\d{6}$/i, "Use a request ID like SNH-000001")
});

export const leadSchema = z.object({
  id: z.string().uuid(),
  request_id: z.string(),
  name: z.string(),
  phone: z.string(),
  type: z.enum(["buyer", "seller", "tenant", "landlord"]),
  district: z.enum(DISTRICTS),
  locality: z.string(),
  pincode: z.string().nullable(),
  property_type: z.enum(PROPERTY_TYPES),
  budget_min: z.number().nullable(),
  budget_max: z.number().nullable(),
  source: z.string(),
  status: z.enum(LEAD_STATUSES),
  request_status: z.enum(REQUEST_STATUSES),
  priority: z.enum(PRIORITIES),
  notes: z.string().nullable(),
  next_followup_at: z.string().nullable(),
  created_at: z.string()
});

export const propertySchema = z.object({
  id: z.string().uuid(),
  property_id: z.string(),
  seller_lead_id: z.string().uuid().nullable(),
  type: z.enum(PROPERTY_TYPES),
  status: z.enum(PROPERTY_STATUSES),
  price: z.number(),
  district: z.enum(DISTRICTS),
  locality: z.string(),
  area: z.string().nullable(),
  pincode: z.string(),
  description: z.string().nullable(),
  created_at: z.string()
});

export const followupSchema = z.object({
  lead_id: z.string().uuid(),
  due_at: z.string(),
  note: z.string().min(2),
  outcome: z.enum(FOLLOWUP_OUTCOMES).optional()
});

export const visitSchema = z.object({
  lead_id: z.string().uuid(),
  property_id: z.string().uuid(),
  scheduled_at: z.string(),
  status: z.enum(VISIT_STATUSES)
});

export type BuyLeadInput = z.infer<typeof buyLeadSchema>;
export type SellLeadInput = z.infer<typeof sellLeadSchema>;
export type TrackRequestInput = z.infer<typeof trackRequestSchema>;
export type Lead = z.infer<typeof leadSchema>;
export type Property = z.infer<typeof propertySchema>;
