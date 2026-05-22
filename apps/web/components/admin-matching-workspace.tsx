"use client";

import { useState } from "react";
import { PropertyMatchLeadsDialog } from "@/components/property-match-leads-dialog";
import type { LeadRow, PropertyRow } from "@/lib/admin-data";
import { formatCurrency } from "@/lib/admin-data";
import { rankLeadsForProperty } from "@/lib/admin-matches";

type AdminMatchingWorkspaceProps = {
  properties: PropertyRow[];
  leads: LeadRow[];
};

export function AdminMatchingWorkspace({ properties, leads }: AdminMatchingWorkspaceProps) {
  const [matchPropertyId, setMatchPropertyId] = useState<string | null>(null);
  const matchProperty = properties.find((property) => property.id === matchPropertyId) ?? null;
  const candidates = matchProperty ? rankLeadsForProperty(matchProperty, leads) : [];

  return (
    <>
      <div className="mt-6 grid gap-4">
        {properties.map((property) => (
          <article key={property.id} className="crm-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-forest">
                  {property.property_id} · {property.locality}, {property.district}
                </h2>
                <p className="mt-1 capitalize text-slate">
                  {property.type} · INR {formatCurrency(property.price)} · {property.status}
                </p>
                <p className="mt-1 text-sm text-slate">Seller: {property.seller?.name ?? "Unassigned"}</p>
              </div>
              <button
                type="button"
                onClick={() => setMatchPropertyId(property.id)}
                className="rounded-lg border border-forest bg-forest px-4 py-2 text-xs font-bold text-white hover:bg-leaf"
              >
                Match to lead
              </button>
            </div>
          </article>
        ))}
      </div>

      {matchProperty ? (
        <PropertyMatchLeadsDialog
          property={matchProperty}
          candidates={candidates}
          redirectPath="/admin/matching"
          onClose={() => setMatchPropertyId(null)}
        />
      ) : null}
    </>
  );
}
