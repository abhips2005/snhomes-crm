import { getFollowups, getLeads } from "@/lib/admin-data";

const OUTCOMES = ["No Answer", "Interested", "Later", "Visit Scheduled", "Closed"];

export default async function FollowupsPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string; q?: string; outcome?: string; sort?: string; ok?: string; error?: string }>;
}) {
  const params = await searchParams;
  const [followups, leads] = await Promise.all([getFollowups(), getLeads(200)]);
  const q = (params.q ?? "").trim().toLowerCase();
  const outcomeFilter = (params.outcome ?? "").trim();
  const sort = (params.sort ?? "due_asc").trim();
  const ok = params.ok === "1";
  const hasError = params.error === "1";
  const now = Date.now();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  const prepared = followups
    .filter((item) => {
      if (outcomeFilter && (item.outcome ?? "Pending") !== outcomeFilter) return false;
      if (!q) return true;
      return `${item.lead?.request_id ?? ""} ${item.lead?.name ?? ""} ${item.note}`.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sort === "due_desc") return new Date(b.due_at).getTime() - new Date(a.due_at).getTime();
      return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
    });

  const groups = {
    Today: prepared.filter((item) => {
      const due = new Date(item.due_at).getTime();
      return due >= todayStart.getTime() && due < tomorrowStart.getTime();
    }),
    Upcoming: prepared.filter((item) => new Date(item.due_at).getTime() >= tomorrowStart.getTime()),
    Overdue: prepared.filter((item) => !item.completed_at && new Date(item.due_at).getTime() < now)
  } as const;
  const activeTab = params.tab && params.tab in groups ? (params.tab as keyof typeof groups) : "Today";
  const visible = groups[activeTab];

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-ink">Followups</h1>
      {ok ? <p className="mt-3 rounded-lg border border-leaf/30 bg-leaf/10 px-3 py-2 text-sm font-semibold text-forest">Followup action saved.</p> : null}
      {hasError ? <p className="mt-3 rounded-lg border border-ember/30 bg-ember/10 px-3 py-2 text-sm font-semibold text-ember">Could not process followup action.</p> : null}
      <form className="crm-card mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" method="get">
        <input type="hidden" name="tab" value={activeTab} />
        <input name="q" defaultValue={params.q ?? ""} placeholder="Search followup note or lead..." className="rounded-lg border border-cloud bg-white px-3 py-2 text-sm font-semibold text-ink lg:col-span-2" />
        <select name="outcome" defaultValue={outcomeFilter} className="rounded-lg border border-cloud bg-white px-3 py-2 text-sm font-semibold text-ink">
          <option value="">All outcomes</option>
          {["Pending", ...OUTCOMES].map((outcome) => (
            <option key={outcome} value={outcome === "Pending" ? "" : outcome}>
              {outcome}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <select name="sort" defaultValue={sort} className="w-full rounded-lg border border-cloud bg-white px-3 py-2 text-sm font-semibold text-ink">
            <option value="due_asc">Due Earliest</option>
            <option value="due_desc">Due Latest</option>
          </select>
          <button className="rounded-lg border border-cloud bg-white px-3 py-2 text-xs font-bold text-forest" type="submit">
            Apply
          </button>
        </div>
      </form>
      <form className="crm-card mt-6 grid gap-3 sm:grid-cols-[1.2fr_1fr_1.8fr_auto]" action="/api/admin/followups" method="post">
        <input
          type="hidden"
          name="redirect"
          value={`/admin/followups?tab=${activeTab}${q ? `&q=${encodeURIComponent(q)}` : ""}${outcomeFilter ? `&outcome=${encodeURIComponent(outcomeFilter)}` : ""}${sort ? `&sort=${encodeURIComponent(sort)}` : ""}`}
        />
        <select required name="lead_id" className="rounded-lg border border-cloud bg-white px-3 py-2 text-sm font-semibold text-ink">
          <option value="">Select lead</option>
          {leads.map((lead) => (
            <option key={lead.id} value={lead.id}>
              {lead.request_id} · {lead.name}
            </option>
          ))}
        </select>
        <input required name="due_at" type="datetime-local" className="rounded-lg border border-cloud bg-white px-3 py-2 text-sm font-semibold text-ink" />
        <input required name="note" minLength={2} placeholder="Followup note" className="rounded-lg border border-cloud bg-white px-3 py-2 text-sm font-semibold text-ink" />
        <button className="rounded-lg border border-cloud bg-white px-4 py-2 text-sm font-bold text-forest transition hover:border-forest/60" type="submit">
          Add Followup
        </button>
      </form>

      <div className="mt-6 flex gap-2">
        {(Object.keys(groups) as Array<keyof typeof groups>).map((tab) => (
          <a
            key={tab}
            href={`/admin/followups?tab=${tab}${q ? `&q=${encodeURIComponent(q)}` : ""}${outcomeFilter ? `&outcome=${encodeURIComponent(outcomeFilter)}` : ""}${sort ? `&sort=${encodeURIComponent(sort)}` : ""}`}
            className={`rounded-lg border px-4 py-2 text-sm font-bold transition ${
              activeTab === tab ? "border-forest bg-forest text-white" : "border-cloud bg-white text-forest hover:border-forest/60"
            }`}
          >
            {tab}
          </a>
        ))}
      </div>
      <div className="crm-card mt-6">
        <div className="grid gap-4">
          {visible.map((item) => (
            <div key={item.id} className="surface-muted grid gap-2 p-4 sm:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
              <p className="text-sm font-black text-forest">{item.lead?.request_id ?? "Lead"} · {item.lead?.name ?? "Unknown"}</p>
              <p className="text-sm font-semibold text-slate">{new Date(item.due_at).toLocaleString("en-IN")}</p>
              <p className="text-sm text-slate">{item.note}</p>
              <form className="flex items-center gap-2" action={`/api/admin/followups/${item.id}`} method="post">
                <input
                  type="hidden"
                  name="redirect"
                  value={`/admin/followups?tab=${activeTab}${q ? `&q=${encodeURIComponent(q)}` : ""}${outcomeFilter ? `&outcome=${encodeURIComponent(outcomeFilter)}` : ""}${sort ? `&sort=${encodeURIComponent(sort)}` : ""}`}
                />
                <select name="outcome" defaultValue={item.outcome ?? ""} className="rounded-lg border border-cloud bg-white px-2 py-1 text-xs font-semibold text-ink">
                  <option value="">Pending</option>
                  {OUTCOMES.map((outcome) => (
                    <option key={outcome} value={outcome}>
                      {outcome}
                    </option>
                  ))}
                </select>
                <button name="complete" value={item.completed_at ? "0" : "1"} className="rounded-lg border border-cloud bg-white px-2 py-1 text-xs font-bold text-forest">
                  {item.completed_at ? "Reopen" : "Done"}
                </button>
              </form>
            </div>
          ))}
          {!visible.length ? <p className="text-sm font-semibold text-slate">No followups in {activeTab.toLowerCase()}.</p> : null}
        </div>
      </div>
    </div>
  );
}
