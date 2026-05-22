import { getSettings } from "@/lib/admin-data";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string; detail?: string }> }) {
  const params = await searchParams;
  const settings = await getSettings();

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-ink">Settings</h1>
      {params.ok === "1" ? <p className="mt-3 rounded-lg border border-leaf/30 bg-leaf/10 px-3 py-2 text-sm font-semibold text-forest">Setting saved.</p> : null}
      {params.error === "1" ? (
        <p className="mt-3 rounded-lg border border-ember/30 bg-ember/10 px-3 py-2 text-sm font-semibold text-ember">
          {params.detail === "json" ? "Invalid JSON value. Fix and retry." : "Could not save setting."}
        </p>
      ) : null}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {settings.map((setting) => (
          <form key={setting.key} className="crm-card" action="/api/admin/settings" method="post">
            <input type="hidden" name="key" value={setting.key} />
            <input type="hidden" name="redirect" value="/admin/settings" />
            <h2 className="text-xl font-black text-forest">{setting.key}</h2>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate/70">JSON value</p>
            <textarea name="value" defaultValue={JSON.stringify(setting.value, null, 2)} className="mt-2 min-h-40 w-full rounded-lg border border-cloud bg-white p-3 text-xs font-semibold text-ink" />
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate/70">Updated {new Date(setting.updated_at).toLocaleString("en-IN")}</p>
              <button className="rounded-lg border border-cloud bg-white px-3 py-2 text-xs font-bold text-forest transition hover:border-forest/60" type="submit">
                Save
              </button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
