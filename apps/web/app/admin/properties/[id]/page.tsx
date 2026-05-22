import Link from "next/link";
import { notFound } from "next/navigation";
import { PropertyPhotoUpload } from "@/components/property-photo-upload";
import { formatCurrency, getPropertyById, getPropertyPhotos } from "@/lib/admin-data";

const statuses = ["Draft", "Pending", "Verified", "Live", "Sold", "Inactive"];

export default async function PropertyDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const property = await getPropertyById(id);
  if (!property) notFound();
  const photos = await getPropertyPhotos(property.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/properties" className="text-sm font-semibold text-slate hover:text-forest">
            ← Back to properties
          </Link>
          <h1 className="mt-2 text-4xl font-extrabold text-ink">{property.property_id}</h1>
          <p className="mt-1 text-slate">
            {property.locality}, {property.district} · {property.type}
          </p>
        </div>
        <span className="rounded-full bg-cream px-4 py-2 text-sm font-black text-forest">{property.status}</span>
      </div>

      {query.ok === "1" ? (
        <p className="rounded-lg border border-leaf/30 bg-leaf/10 px-3 py-2 text-sm font-semibold text-forest">Property saved.</p>
      ) : null}
      {query.error === "1" ? (
        <p className="rounded-lg border border-ember/30 bg-ember/10 px-3 py-2 text-sm font-semibold text-ember">Could not save property.</p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <section className="crm-card">
          <h2 className="font-black text-forest">Listing overview</h2>
          <div className="mt-4 space-y-2 text-sm text-slate">
            <p>
              <span className="font-semibold text-ink">Price:</span> INR {formatCurrency(property.price)}
            </p>
            <p>
              <span className="font-semibold text-ink">Pincode:</span> {property.pincode}
            </p>
            <p>
              <span className="font-semibold text-ink">Area (legacy):</span> {property.area ?? "—"}
            </p>
            <p>
              <span className="font-semibold text-ink">Seller:</span> {property.seller?.name ?? "Unassigned"}
              {property.seller?.request_id ? ` (${property.seller.request_id})` : ""}
            </p>
            <p>
              <span className="font-semibold text-ink">Description:</span> {property.description?.trim() || "—"}
            </p>
          </div>
        </section>

        <section className="crm-card">
          <h2 className="font-black text-forest">Admin details</h2>
          <form action="/api/admin/properties/update" method="post" className="mt-4 grid gap-3">
            <input type="hidden" name="property_id" value={property.id} />
            <input type="hidden" name="redirect" value={`/admin/properties/${property.id}`} />

            <label className="grid gap-1 text-sm">
              <span className="font-semibold text-slate">Property status</span>
              <select name="status" defaultValue={property.status} className="rounded-lg border border-cloud px-3 py-2 font-semibold text-ink">
                {statuses.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                <span className="font-semibold text-slate">Bedrooms (optional)</span>
                <input name="bedrooms" type="number" min={0} defaultValue={property.bedrooms ?? ""} className="rounded-lg border border-cloud px-3 py-2" />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-semibold text-slate">Bathrooms (optional)</span>
                <input name="bathrooms" type="number" min={0} defaultValue={property.bathrooms ?? ""} className="rounded-lg border border-cloud px-3 py-2" />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-semibold text-slate">Sqft (optional)</span>
                <input name="sqft" type="number" min={0} step="0.01" defaultValue={property.sqft ?? ""} className="rounded-lg border border-cloud px-3 py-2" />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-semibold text-slate">Land area (optional)</span>
                <input name="land_area" defaultValue={property.land_area ?? ""} placeholder="e.g. 10 cents" className="rounded-lg border border-cloud px-3 py-2" />
              </label>
            </div>

            <label className="grid gap-1 text-sm">
              <span className="font-semibold text-slate">Additional notes (optional, admin only)</span>
              <textarea
                name="additional_notes"
                rows={4}
                defaultValue={property.additional_notes ?? ""}
                className="rounded-lg border border-cloud px-3 py-2"
                placeholder="Internal notes for agents — not shown on public forms"
              />
            </label>

            <button type="submit" className="btn-primary w-fit px-5 py-2 text-xs">
              Save property
            </button>
          </form>
        </section>
      </div>

      <PropertyPhotoUpload propertyId={property.id} initialPhotos={photos} />
    </div>
  );
}
