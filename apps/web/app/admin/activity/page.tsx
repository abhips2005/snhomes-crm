import { getActivities } from "@/lib/admin-data";

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const activities = await getActivities(50);
  const query = (params.q ?? "").trim().toLowerCase();
  const filtered = query
    ? activities.filter((activity) =>
        `${activity.action} ${activity.entity_type} ${activity.description ?? ""}`.toLowerCase().includes(query)
      )
    : activities;

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-ink">Activity Log</h1>
      <form className="mt-4">
        <input
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search activities"
          className="w-full max-w-md rounded-lg border border-cloud bg-white px-3 py-2 text-sm font-semibold text-ink"
        />
      </form>
      <div className="mt-6 grid gap-3">
        {filtered.map((activity) => (
          <p key={activity.id} className="rounded-xl border border-cloud bg-white p-4 font-semibold text-slate shadow-sm">
            {activity.description ?? `${activity.action} · ${activity.entity_type}`}
          </p>
        ))}
        {!filtered.length ? <p className="text-sm font-semibold text-slate">No activities match this filter.</p> : null}
      </div>
    </div>
  );
}
