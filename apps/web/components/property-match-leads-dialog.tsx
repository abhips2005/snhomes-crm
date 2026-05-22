"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { PropertyRow } from "@/lib/admin-data";
import { formatBudgetRange } from "@/lib/admin-data";

type LeadCandidate = {
  id: string;
  request_id: string;
  name: string;
  type: string;
  district: string;
  locality: string;
  budget_min: number | null;
  budget_max: number | null;
  score: number;
};

type PropertyMatchLeadsDialogProps = {
  property: PropertyRow;
  candidates: LeadCandidate[];
  redirectPath: string;
  onClose: () => void;
};

export function PropertyMatchLeadsDialog({ property, candidates, redirectPath, onClose }: PropertyMatchLeadsDialogProps) {
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

  const dialog = (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6">
      <button type="button" aria-label="Close match dialog" className="absolute inset-0 bg-ink/45" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 flex max-h-[min(84dvh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-cloud bg-white shadow-soft"
      >
        <div className="flex items-center justify-between border-b border-cloud px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-leaf">Match to lead</p>
            <h2 className="text-xl font-black text-forest">
              {property.property_id} · {property.locality}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-lg border border-cloud hover:bg-cream">
            <X size={20} />
          </button>
        </div>
        <div className="max-h-[calc(84vh-4rem)] overflow-y-auto p-4">
          {candidates.length ? (
            candidates.map((lead) => (
              <article key={lead.id} className="mb-3 rounded-xl border border-cloud bg-cream p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-forest">{lead.name}</p>
                    <p className="text-sm text-slate">
                      {lead.request_id} · {lead.type} · {lead.locality}, {lead.district}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-forest">{formatBudgetRange(lead.budget_min, lead.budget_max)}</p>
                  </div>
                  <div className="rounded-lg bg-forest px-3 py-2 text-center text-white">
                    <p className="text-xl font-black">{lead.score}</p>
                    <p className="text-[10px] font-bold uppercase">Score</p>
                  </div>
                </div>
                <form action="/api/admin/matches" method="post" className="mt-3">
                  <input type="hidden" name="lead_id" value={lead.id} />
                  <input type="hidden" name="property_id" value={property.id} />
                  <input type="hidden" name="score" value={lead.score} />
                  <input type="hidden" name="status" value="Matched" />
                  <input type="hidden" name="redirect" value={redirectPath} />
                  <button type="submit" className="rounded-lg border border-forest bg-forest px-4 py-2 text-xs font-bold text-white hover:bg-leaf">
                    Match to this lead
                  </button>
                </form>
              </article>
            ))
          ) : (
            <p className="text-sm text-slate">No buy/rent leads match this property yet.</p>
          )}
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(dialog, document.body);
}
