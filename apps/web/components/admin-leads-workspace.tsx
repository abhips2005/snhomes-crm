"use client";

import { useMemo, useState } from "react";
import { AdminLeadDetailDialog } from "@/components/admin-lead-detail-dialog";
import type { LeadPropertyMatch, LeadRow } from "@/lib/admin-data";
import { formatBudgetRange } from "@/lib/admin-data";

type Followup = {
  id: string;
  due_at: string;
  note: string;
  outcome: string | null;
  lead?: { request_id?: string } | null;
};

type Activity = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  description: string | null;
  created_at: string;
};

type AdminLeadsWorkspaceProps = {
  leads: LeadRow[];
  activities: Activity[];
  propertyMatchesByLeadId: Record<string, LeadPropertyMatch[]>;
  activitiesByLeadId: Record<string, Activity[]>;
  followupsByRequestId: Record<string, Followup[]>;
  emptyMessage: string;
};

export function AdminLeadsWorkspace({
  leads,
  activities,
  propertyMatchesByLeadId,
  activitiesByLeadId,
  followupsByRequestId,
  emptyMessage
}: AdminLeadsWorkspaceProps) {
  const [openLeadId, setOpenLeadId] = useState<string | null>(null);
  const openLead = useMemo(() => leads.find((lead) => lead.id === openLeadId) ?? null, [leads, openLeadId]);

  return (
    <>
      <div className="mt-6 overflow-x-auto">
        <table className="crm-table">
          <thead>
            <tr>
              {["Lead ID", "Name", "Phone", "Type", "District", "Locality", "Budget", "Status", "Priority", "Actions"].map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.length ? (
              leads.map((lead) => (
                <tr key={lead.request_id}>
                  <td className="font-black text-forest">{lead.request_id}</td>
                  <td>{lead.name}</td>
                  <td>{lead.phone}</td>
                  <td className="capitalize">{lead.type}</td>
                  <td>{lead.district}</td>
                  <td>{lead.locality}</td>
                  <td>{formatBudgetRange(lead.budget_min, lead.budget_max)}</td>
                  <td>{lead.status}</td>
                  <td>{lead.priority}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setOpenLeadId(lead.id)}
                        className="rounded-lg border border-cloud bg-white px-3 py-1 text-xs font-bold text-forest transition hover:border-forest/60"
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void fetch("/api/admin/leads/activity", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ lead_id: lead.id, channel: "call" })
                          });
                          window.location.href = `tel:+91${lead.phone}`;
                        }}
                        className="rounded-lg border border-cloud bg-white px-3 py-1 text-xs font-bold text-forest transition hover:border-forest/60"
                      >
                        Call
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void fetch("/api/admin/leads/activity", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ lead_id: lead.id, channel: "whatsapp" })
                          });
                          window.open(`https://wa.me/91${lead.phone}`, "_blank", "noopener,noreferrer");
                        }}
                        className="rounded-lg border border-cloud bg-white px-3 py-1 text-xs font-bold text-forest transition hover:border-forest/60"
                      >
                        WhatsApp
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-sm font-semibold text-slate">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {openLead ? (
        <AdminLeadDetailDialog
          lead={openLead}
          followups={followupsByRequestId[openLead.request_id] ?? []}
          activities={activitiesByLeadId[openLead.id] ?? activities.filter((item) => (item.description ?? "").includes(openLead.request_id))}
          propertyMatches={propertyMatchesByLeadId[openLead.id] ?? []}
          onClose={() => setOpenLeadId(null)}
        />
      ) : null}
    </>
  );
}
