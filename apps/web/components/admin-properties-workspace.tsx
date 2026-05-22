"use client";

import Link from "next/link";
import { useState } from "react";
import { PropertyMatchLeadsDialog } from "@/components/property-match-leads-dialog";
import type { LeadRow, PropertyRow } from "@/lib/admin-data";
import { formatCurrency } from "@/lib/admin-data";
import { rankLeadsForProperty } from "@/lib/admin-matches";

type AdminPropertiesWorkspaceProps = {
  properties: PropertyRow[];
  leads: LeadRow[];
  redirectUrl: string;
};

export function AdminPropertiesWorkspace({ properties, leads, redirectUrl }: AdminPropertiesWorkspaceProps) {
  const [matchPropertyId, setMatchPropertyId] = useState<string | null>(null);
  const matchProperty = properties.find((property) => property.id === matchPropertyId) ?? null;
  const candidates = matchProperty ? rankLeadsForProperty(matchProperty, leads) : [];

  return (
    <>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {properties.map((property) => (
          <article key={property.property_id} className="crm-card">
            <div className="flex items-center justify-between">
              <Link href={`/admin/properties/${property.id}`} className="font-black text-forest hover:underline">
                {property.property_id}
              </Link>
              <span className="rounded-full bg-cream px-3 py-1 text-xs font-black text-forest">{property.status}</span>
            </div>
            <h2 className="mt-4 text-2xl font-black capitalize text-forest">{property.type}</h2>
            <p className="mt-1 text-sm font-semibold text-slate">
              {property.locality}, {property.district}
            </p>
            <p className="mt-4 text-3xl font-black text-gold">INR {formatCurrency(property.price)}</p>
            <p className="mt-2 text-sm text-slate">Seller: {property.seller?.name ?? "Unassigned"}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href={`/admin/properties/${property.id}`}
                className="rounded-lg border border-cloud bg-white px-3 py-2 text-xs font-bold text-forest transition hover:border-forest/60"
              >
                View details
              </Link>
              <button
                type="button"
                onClick={() => setMatchPropertyId(property.id)}
                className="rounded-lg border border-forest bg-forest px-3 py-2 text-xs font-bold text-white transition hover:bg-leaf"
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
          redirectPath={redirectUrl}
          onClose={() => setMatchPropertyId(null)}
        />
      ) : null}
    </>
  );
}
