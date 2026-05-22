import { getLeads, getProperties, getVisits } from "@/lib/admin-data";

export default async function VisitsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; status?: string; sort?: string; ok?: string; error?: string }>;
}) {
  const params = await searchParams;
  const [visits, leads, properties] = await Promise.all([getVisits(), getLeads(200), getProperties(200)]);
  const q = (params.q ?? "").trim().toLowerCase();
  const statusFilter = (params.status ?? "").trim();
  const sort = (params.sort ?? "scheduled_asc").trim();
  const ok = params.ok === "1";
  const hasError = params.error === "1";

  const visibleVisits = visits
    .filter((visit) => {
      if (statusFilter && visit.status !== statusFilter) return false;
      if (!q) return true;
      return `${visit.lead?.name ?? ""} ${visit.property?.property_id ?? ""} ${visit.property?.locality ?? ""} ${visit.property?.district ?? ""}`
        .toLowerCase()
        .includes(q);
    })
    .sort((a, b) => {
      if (sort === "scheduled_desc") return new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime();
      if (sort === "lead_asc") return (a.lead?.name ?? "").localeCompare(b.lead?.name ?? "");
      return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();
    });

  const grouped = {
    Scheduled: visibleVisits.filter((visit) => visit.status === "Scheduled"),
    Completed: visibleVisits.filter((visit) => visit.status === "Completed"),
    Cancelled: visibleVisits.filter((visit) => visit.status === "Cancelled")
  } as const;

  const currentFilters = new URLSearchParams();
  if (params.q) currentFilters.set("q", params.q);
  if (params.status) currentFilters.set("status", params.status);
  if (params.sort) currentFilters.set("sort", params.sort);
  const redirectUrl = currentFilters.size ? `/admin/visits?${currentFilters.toString()}` : "/admin/visits";

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-extrabold text-ink">Site Visits</h1>
      {ok ? <p className="rounded-lg border border-leaf/30 bg-leaf/10 px-3 py-2 text-sm font-semibold text-forest">Visit action saved.</p> : null}
      {hasError ? <p className="rounded-lg border border-ember/30 bg-ember/10 px-3 py-2 text-sm font-semibold text-ember">Visit action failed. Please verify data.</p> : null}
      <form className="crm-card grid gap-3 sm:grid-cols-2 lg:grid-cols-4" method="get">
        <input name="q" defaultValue={params.q ?? ""} placeholder="Search lead, property, locality..." className="rounded-lg border border-cloud bg-white px-3 py-2 text-sm font-semibold text-ink lg:col-span-2" />
        <select name="status" defaultValue={statusFilter} className="rounded-lg border border-cloud bg-white px-3 py-2 text-sm font-semibold text-ink">
          <option value="">All statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <div className="flex gap-2">
          <select name="sort" defaultValue={sort} className="w-full rounded-lg border border-cloud bg-white px-3 py-2 text-sm font-semibold text-ink">
            <option value="scheduled_asc">Schedule Earliest</option>
            <option value="scheduled_desc">Schedule Latest</option>
            <option value="lead_asc">Lead A-Z</option>
          </select>
          <button className="rounded-lg border border-cloud bg-white px-3 py-2 text-xs font-bold text-forest" type="submit">
            Apply
          </button>
        </div>
      </form>
      <form className="crm-card mt-6 grid gap-3 sm:grid-cols-[1.2fr_1.2fr_1fr_auto]" action="/api/admin/visits" method="post">
        <input type="hidden" name="redirect" value={redirectUrl} />
        <select required name="lead_id" className="rounded-lg border border-cloud bg-white px-3 py-2 text-sm font-semibold text-ink">
          <option value="">Select lead</option>
          {leads.map((lead) => (
            <option key={lead.id} value={lead.id}>
              {lead.request_id} · {lead.name}
            </option>
          ))}
        </select>
        <select required name="property_id" className="rounded-lg border border-cloud bg-white px-3 py-2 text-sm font-semibold text-ink">
          <option value="">Select property</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.property_id} · {property.locality}, {property.district}
            </option>
          ))}
        </select>
        <input required name="scheduled_at" type="datetime-local" className="rounded-lg border border-cloud bg-white px-3 py-2 text-sm font-semibold text-ink" />
        <button className="rounded-lg border border-cloud bg-white px-4 py-2 text-sm font-bold text-forest transition hover:border-forest/60" type="submit">
          Schedule
        </button>
      </form>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {(Object.keys(grouped) as Array<keyof typeof grouped>).map((status) => (
          <section key={status} className="crm-card">
            <h2 className="text-xl font-black text-forest">{status}</h2>
            <p className="mt-3 text-sm text-slate">{grouped[status].length} visit(s)</p>
            <div className="mt-4 grid gap-3">
              {grouped[status].slice(0, 6).map((visit) => (
                <div key={visit.id} className="rounded-xl border border-cloud bg-cream p-3 text-sm">
                  <p className="font-black text-forest">{visit.lead?.name ?? "Lead"} · {visit.property?.property_id ?? "Property"}</p>
                  <p className="mt-1 text-slate">{visit.property?.locality ?? "Locality"}, {visit.property?.district ?? "District"}</p>
                  <p className="mt-1 font-semibold text-slate">{new Date(visit.scheduled_at).toLocaleString("en-IN")}</p>
                  <div className="mt-2 flex gap-2">
                    {["Scheduled", "Completed", "Cancelled"].map((next) => (
                      <form key={next} action={`/api/admin/visits/${visit.id}`} method="post">
                        <input type="hidden" name="status" value={next} />
                        <input type="hidden" name="redirect" value={redirectUrl} />
                        <button
                          type="submit"
                          className={`rounded-md border px-2 py-1 text-xs font-bold ${
                            visit.status === next ? "border-forest bg-forest text-white" : "border-cloud bg-white text-forest"
                          }`}
                        >
                          {next}
                        </button>
                      </form>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      {!visibleVisits.length ? <p className="text-sm font-semibold text-slate">No visits found for selected filters.</p> : null}
    </div>
  );
}
