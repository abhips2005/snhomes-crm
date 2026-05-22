"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { LeadPropertyMatch, LeadRow } from "@/lib/admin-data";
import { formatBudgetRange, formatCurrency } from "@/lib/admin-data";

type Activity = {
  id: string;
  action: string;
  description: string | null;
  created_at: string;
};

type Followup = {
  id: string;
  due_at: string;
  note: string;
  outcome: string | null;
};

type LeadDetailDialogProps = {
  lead: LeadRow;
  followups: Followup[];
  activities: Activity[];
  propertyMatches: LeadPropertyMatch[];
  onClose: () => void;
};

const leadStatuses = ["New", "Contacted", "Qualified", "Matching", "Shortlisted", "Site Visit", "Negotiation", "Closed", "Lost"] as const;
const requestStatuses = ["Received", "Reviewing", "Matching", "Contacted", "Site Visit", "Closed"] as const;
const priorities = ["Cold", "Warm", "Hot"] as const;

export function AdminLeadDetailDialog({ lead, followups, activities: initialActivities, propertyMatches, onClose }: LeadDetailDialogProps) {
  const router = useRouter();
  const [status, setStatus] = useState(lead.status);
  const [requestStatus, setRequestStatus] = useState(lead.request_status);
  const [priority, setPriority] = useState(lead.priority);
  const [activities, setActivities] = useState(initialActivities);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  async function saveLeadUpdates() {
    setSaving(true);
    setMessage(null);
    const response = await fetch("/api/admin/leads/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lead_id: lead.id,
        status,
        request_status: requestStatus,
        priority
      })
    });
    setSaving(false);
    if (!response.ok) {
      setMessage("Could not save lead updates.");
      return;
    }
    setMessage("Lead updated.");
    router.refresh();
  }

  async function logContact(channel: "call" | "whatsapp") {
    await fetch("/api/admin/leads/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_id: lead.id, channel })
    }).then(async (response) => {
      if (!response.ok) return;
      const payload = (await response.json()) as { description?: string; when?: string };
      setActivities((current) => [
        {
          id: `temp-${Date.now()}`,
          action: channel === "call" ? "Lead Call" : "Lead WhatsApp",
          description: payload.description ?? `${channel} logged`,
          created_at: new Date().toISOString()
        },
        ...current
      ]);
    });

    if (channel === "call") {
      window.location.href = `tel:+91${lead.phone}`;
      return;
    }
    window.open(`https://wa.me/91${lead.phone}`, "_blank", "noopener,noreferrer");
  }

  const dialog = (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6">
      <button type="button" aria-label="Close lead details" className="absolute inset-0 bg-ink/45" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-dialog-title"
        className="relative z-10 flex max-h-[min(88dvh,900px)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-cloud bg-white shadow-soft"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-cloud px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-leaf">{lead.request_id}</p>
            <h2 id="lead-dialog-title" className="text-2xl font-black text-forest">
              {lead.name}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-lg border border-cloud text-forest hover:bg-cream">
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="crm-card">
              <h3 className="font-black text-forest">Profile</h3>
              <div className="mt-3 space-y-1 text-sm text-slate">
                <p><span className="font-semibold text-ink">Type:</span> {lead.type}</p>
                <p><span className="font-semibold text-ink">Phone:</span> {lead.phone}</p>
                <p><span className="font-semibold text-ink">Location:</span> {lead.locality}, {lead.district}</p>
                <p><span className="font-semibold text-ink">Budget:</span> {formatBudgetRange(lead.budget_min, lead.budget_max)}</p>
                <p><span className="font-semibold text-ink">Source:</span> {lead.source}</p>
              </div>
            </section>

            <section className="crm-card">
              <h3 className="font-black text-forest">Notes</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate">{lead.notes?.trim() || "No notes captured yet."}</p>
            </section>

            <section className="crm-card lg:col-span-2">
              <h3 className="font-black text-forest">Update status</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-slate">Lead Status</span>
                  <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-cloud px-3 py-2 font-semibold text-ink">
                    {leadStatuses.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-slate">Request Status</span>
                  <select value={requestStatus} onChange={(event) => setRequestStatus(event.target.value)} className="rounded-lg border border-cloud px-3 py-2 font-semibold text-ink">
                    {requestStatuses.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-slate">Priority</span>
                  <select value={priority} onChange={(event) => setPriority(event.target.value)} className="rounded-lg border border-cloud px-3 py-2 font-semibold text-ink">
                    {priorities.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button type="button" onClick={saveLeadUpdates} disabled={saving} className="btn-primary px-4 py-2 text-xs">
                  {saving ? "Saving…" : "Save changes"}
                </button>
                {message ? <p className="text-sm font-semibold text-forest">{message}</p> : null}
              </div>
            </section>

            <section className="crm-card">
              <h3 className="font-black text-forest">Contact</h3>
              <div className="mt-3 grid gap-2">
                <button type="button" onClick={() => logContact("call")} className="rounded-lg border border-cloud bg-white px-3 py-2 text-sm font-semibold text-forest hover:border-forest/60">
                  Call {lead.phone}
                </button>
                <button type="button" onClick={() => logContact("whatsapp")} className="rounded-lg border border-cloud bg-white px-3 py-2 text-sm font-semibold text-forest hover:border-forest/60">
                  WhatsApp {lead.name}
                </button>
              </div>
            </section>

            <section className="crm-card">
              <h3 className="font-black text-forest">Next followup</h3>
              <div className="mt-3 grid gap-2">
                {followups.length ? (
                  followups.slice(0, 3).map((followup) => (
                    <div key={followup.id} className="rounded-lg border border-cloud bg-cream p-2 text-sm text-slate">
                      <p className="font-semibold text-ink">{new Date(followup.due_at).toLocaleString("en-IN")}</p>
                      <p>{followup.note}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate">No followups scheduled.</p>
                )}
              </div>
            </section>

            <section className="crm-card lg:col-span-2">
              <h3 className="font-black text-forest">Activity</h3>
              <div className="mt-3 grid max-h-48 gap-2 overflow-y-auto">
                {activities.length ? (
                  activities.map((item) => (
                    <p key={item.id} className="rounded-lg border border-cloud bg-cream p-2 text-sm text-slate">
                      <span className="font-semibold text-ink">{new Date(item.created_at).toLocaleString("en-IN")}</span>
                      {" · "}
                      {item.description ?? item.action}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-slate">No activity logged for this lead yet.</p>
                )}
              </div>
            </section>

            <section className="crm-card lg:col-span-2">
              <h3 className="font-black text-forest">Property matches</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {propertyMatches.length ? (
                  propertyMatches.map((property) => (
                    <Link
                      key={property.id}
                      href={`/admin/properties/${property.id}`}
                      className="rounded-xl border border-cloud bg-cream p-3 text-sm text-slate transition hover:border-leaf/50 hover:bg-white"
                    >
                      <p className="font-black text-ink">{property.property_id}</p>
                      <p>{property.locality}, {property.district}</p>
                      <p className="capitalize">
                        {property.type} · INR {formatCurrency(property.price)}
                      </p>
                      <p className="mt-1 font-semibold text-forest">
                        Score {property.score}
                        {property.match_status ? ` · ${property.match_status}` : " · Suggested"}
                        {property.source === "suggested" ? " · Auto" : ""}
                      </p>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-slate">No matching properties for this lead yet.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(dialog, document.body);
}
