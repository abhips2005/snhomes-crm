import { AdminMatchingWorkspace } from "@/components/admin-matching-workspace";
import { getLeads, getProperties } from "@/lib/admin-data";

export default async function MatchingPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string; detail?: string }> }) {
  const params = await searchParams;
  const [properties, leads] = await Promise.all([getProperties(200), getLeads(200)]);

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-ink">Matching</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate">
        Match listings to buy/rent leads. A property is never matched to the lead who posted that listing.
      </p>
      {params.ok === "1" ? (
        <p className="mt-3 rounded-lg border border-leaf/30 bg-leaf/10 px-3 py-2 text-sm font-semibold text-forest">Match saved. It will appear on the lead&apos;s Property Matches.</p>
      ) : null}
      {params.error === "1" ? (
        <p className="mt-3 rounded-lg border border-ember/30 bg-ember/10 px-3 py-2 text-sm font-semibold text-ember">
          {params.detail === "own-listing" ? "Cannot match a property to the seller who posted it." : "Could not save match."}
        </p>
      ) : null}
      {!properties.length ? (
        <div className="crm-card mt-6">
          <p className="text-sm font-semibold text-slate">No properties available yet.</p>
        </div>
      ) : (
        <AdminMatchingWorkspace properties={properties} leads={leads} />
      )}
    </div>
  );
}
