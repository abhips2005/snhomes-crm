import { getActivities, getDashboardCharts, getDashboardStats } from "@/lib/admin-data";

export default async function AdminDashboard() {
  const [dashboardStats, activities, chartData] = await Promise.all([getDashboardStats(), getActivities(6), getDashboardCharts()]);
  const bars = [chartData.source, chartData.district, chartData.status] as const;
  const titles = ["Leads by Source", "District Demand", "Lead Lifecycle"] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Super Admin</p>
          <h1 className="mt-2 text-4xl font-extrabold text-ink">CRM Dashboard</h1>
          <p className="mt-2 text-sm font-medium text-slate">Live operational overview of leads, listings, and field activity.</p>
        </div>
        <p className="rounded-full border border-cloud bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-slate">
          {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-cloud/80 bg-white p-5 shadow-card">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate">{label}</p>
            <p className="mt-3 text-4xl font-black text-forest">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.8fr_1fr]">
        <section className="rounded-2xl border border-cloud/80 bg-white p-5 shadow-card">
          <h2 className="text-lg font-black text-ink">Performance Insights</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {titles.map((title, index) => {
              const series = bars[index] ?? [];
              const max = Math.max(...series, 1);
              return (
                <div key={title} className="rounded-xl border border-cloud/70 bg-cream/80 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate">{title}</p>
                  {series.length ? (
                    <div className="mt-4 flex h-28 items-end gap-2">
                      {series.map((value, barIndex) => (
                        <span
                          key={barIndex}
                          className="flex-1 rounded-sm bg-gradient-to-t from-forest to-leaf"
                          style={{ height: `${Math.max(18, Math.round((value / max) * 100))}%` }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 grid h-28 place-items-center rounded-lg border border-dashed border-cloud bg-white text-xs font-semibold text-slate">
                      No data yet
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
        <section className="rounded-2xl border border-cloud/80 bg-white p-5 shadow-card">
          <h2 className="text-lg font-black text-ink">Recent Activity</h2>
          <div className="mt-4 grid gap-3">
            {activities.map((activity) => (
              <div key={activity.id} className="rounded-xl border border-cloud bg-cream p-3">
                <p className="text-sm font-semibold text-slate">{activity.description ?? `${activity.action} · ${activity.entity_type}`}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate/70">
                  {new Date(activity.created_at).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
