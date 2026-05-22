import { AdminPropertiesWorkspace } from "@/components/admin-properties-workspace";
import { getLeads, getProperties } from "@/lib/admin-data";

export default async function PropertiesPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; status?: string; type?: string; district?: string; sort?: string; ok?: string; error?: string }>;
}) {
  const params = await searchParams;
  const [properties, leads] = await Promise.all([getProperties(), getLeads(200)]);
  const q = (params.q ?? "").trim().toLowerCase();
  const status = (params.status ?? "").trim();
  const type = (params.type ?? "").trim();
  const district = (params.district ?? "").trim();
  const sort = (params.sort ?? "created_desc").trim();
  const ok = params.ok === "1";
  const hasError = params.error === "1";
  const statuses = ["Draft", "Pending", "Verified", "Live", "Sold", "Inactive"];

  const visible = properties
    .filter((property) => {
      if (status && property.status !== status) return false;
      if (type && property.type !== type) return false;
      if (district && property.district !== district) return false;
      if (!q) return true;
      return `${property.property_id} ${property.locality} ${property.district} ${property.seller?.name ?? ""}`.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sort === "price_asc") return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      if (sort === "status_asc") return a.status.localeCompare(b.status);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const currentFilters = new URLSearchParams();
  if (params.q) currentFilters.set("q", params.q);
  if (params.status) currentFilters.set("status", params.status);
  if (params.type) currentFilters.set("type", params.type);
  if (params.district) currentFilters.set("district", params.district);
  if (params.sort) currentFilters.set("sort", params.sort);
  const redirectUrl = currentFilters.size ? `/admin/properties?${currentFilters.toString()}` : "/admin/properties";
  const types = Array.from(new Set(properties.map((property) => property.type))).sort();
  const districts = Array.from(new Set(properties.map((property) => property.district))).sort();

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-extrabold text-ink">Properties</h1>
      {ok ? <p className="rounded-lg border border-leaf/30 bg-leaf/10 px-3 py-2 text-sm font-semibold text-forest">Property updated successfully.</p> : null}
      {hasError ? <p className="rounded-lg border border-ember/30 bg-ember/10 px-3 py-2 text-sm font-semibold text-ember">Could not update property. Check inputs and try again.</p> : null}
      <form className="crm-card grid gap-3 sm:grid-cols-2 lg:grid-cols-6" method="get">
        <input name="q" defaultValue={params.q ?? ""} placeholder="Search property, locality, seller..." className="rounded-lg border border-cloud bg-white px-3 py-2 text-sm font-semibold text-ink lg:col-span-2" />
        <select name="status" defaultValue={status} className="rounded-lg border border-cloud bg-white px-3 py-2 text-sm font-semibold text-ink">
          <option value="">All statuses</option>
          {statuses.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select name="type" defaultValue={type} className="rounded-lg border border-cloud bg-white px-3 py-2 text-sm font-semibold text-ink">
          <option value="">All types</option>
          {types.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select name="district" defaultValue={district} className="rounded-lg border border-cloud bg-white px-3 py-2 text-sm font-semibold text-ink">
          <option value="">All districts</option>
          {districts.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <select name="sort" defaultValue={sort} className="w-full rounded-lg border border-cloud bg-white px-3 py-2 text-sm font-semibold text-ink">
            <option value="created_desc">Newest</option>
            <option value="price_asc">Price Low-High</option>
            <option value="price_desc">Price High-Low</option>
            <option value="status_asc">Status A-Z</option>
          </select>
          <button className="rounded-lg border border-cloud bg-white px-3 py-2 text-xs font-bold text-forest" type="submit">
            Apply
          </button>
        </div>
      </form>
      {visible.length ? (
        <AdminPropertiesWorkspace properties={visible} leads={leads} redirectUrl={redirectUrl} />
      ) : (
        <p className="text-sm font-semibold text-slate">No properties found for selected filters.</p>
      )}
    </div>
  );
}
