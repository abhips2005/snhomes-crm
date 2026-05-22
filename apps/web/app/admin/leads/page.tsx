import { AdminLeadsWorkspace } from "@/components/admin-leads-workspace";
import { getActivities, getActivitiesForLead, getFollowups, getLeadPropertyMatches, getLeads, getProperties } from "@/lib/admin-data";

export default async function LeadsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; type?: string; status?: string; district?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const [leads, followups, properties] = await Promise.all([getLeads(), getFollowups(), getProperties(500)]);

  const q = (params.q ?? "").trim().toLowerCase();
  const type = (params.type ?? "").trim();
  const status = (params.status ?? "").trim();
  const district = (params.district ?? "").trim();
  const sort = (params.sort ?? "created_desc").trim();

  const districts = Array.from(new Set(leads.map((lead) => lead.district))).sort();
  const statuses = Array.from(new Set(leads.map((lead) => lead.status))).sort();
  const types = Array.from(new Set(leads.map((lead) => lead.type))).sort();

  const visibleLeads = leads
    .filter((lead) => {
      if (type && lead.type !== type) return false;
      if (status && lead.status !== status) return false;
      if (district && lead.district !== district) return false;
      if (!q) return true;
      return `${lead.request_id} ${lead.name} ${lead.phone} ${lead.locality} ${lead.district}`.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sort === "name_asc") return a.name.localeCompare(b.name);
      if (sort === "priority_desc") return b.priority.localeCompare(a.priority);
      if (sort === "status_asc") return a.status.localeCompare(b.status);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const hasFilters = Boolean(q || type || status || district);
  const emptyMessage =
    leads.length === 0 ? "No leads available yet." : hasFilters ? "No leads found for selected filters." : "No leads available yet.";

  const [propertyMatchesEntries, activitiesEntries] = await Promise.all([
    Promise.all(visibleLeads.map(async (lead) => [lead.id, await getLeadPropertyMatches(lead, properties)] as const)),
    Promise.all(visibleLeads.map(async (lead) => [lead.id, await getActivitiesForLead(lead.id, lead.request_id)] as const))
  ]);

  const propertyMatchesByLeadId = Object.fromEntries(propertyMatchesEntries);
  const activitiesByLeadId = Object.fromEntries(activitiesEntries);
  const followupsByRequestId: Record<string, typeof followups> = {};
  for (const item of followups) {
    const requestId = item.lead?.request_id;
    if (!requestId) continue;
    (followupsByRequestId[requestId] ??= []).push(item);
  }

  const activities = await getActivities(80);

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-extrabold text-ink">Leads</h1>
      <form className="crm-card grid gap-3 sm:grid-cols-2 lg:grid-cols-6" method="get">
        <input name="q" defaultValue={params.q ?? ""} placeholder="Search lead, phone, locality..." className="rounded-lg border border-cloud bg-white px-3 py-2 text-sm font-semibold text-ink lg:col-span-2" />
        <select name="type" defaultValue={type} className="rounded-lg border border-cloud bg-white px-3 py-2 text-sm font-semibold text-ink">
          <option value="">All types</option>
          {types.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={status} className="rounded-lg border border-cloud bg-white px-3 py-2 text-sm font-semibold text-ink">
          <option value="">All statuses</option>
          {statuses.map((value) => (
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
            <option value="name_asc">Name A-Z</option>
            <option value="priority_desc">Priority</option>
            <option value="status_asc">Status A-Z</option>
          </select>
          <button className="rounded-lg border border-cloud bg-white px-3 py-2 text-xs font-bold text-forest" type="submit">
            Apply
          </button>
        </div>
      </form>

      <AdminLeadsWorkspace
        leads={visibleLeads}
        activities={activities}
        propertyMatchesByLeadId={propertyMatchesByLeadId}
        activitiesByLeadId={activitiesByLeadId}
        followupsByRequestId={followupsByRequestId}
        emptyMessage={emptyMessage}
      />
    </div>
  );
}
