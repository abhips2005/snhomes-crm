import { getAnalyticsSnapshot } from "@/lib/admin-data";

export default async function AnalyticsPage() {
  const metrics = await getAnalyticsSnapshot();

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-ink">Analytics</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {metrics.map(([label, value]) => (
          <div key={label} className="crm-card p-6">
            <p className="text-sm font-bold text-slate">{label}</p>
            <p className="mt-3 text-4xl font-black text-forest">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
