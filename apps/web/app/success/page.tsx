import Link from "next/link";
import { PageShell } from "@/components/page-shell";

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ requestId?: string; type?: string }> }) {
  const params = await searchParams;
  const requestId = params.requestId ?? "SNH-000000";
  const typeLabel = params.type === "property" ? "Property Received" : "Requirement Received";
  return (
    <PageShell>
      <section className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-5 py-16 text-center">
        <div className="surface-card rounded-3xl p-10 sm:p-14">
          <p className="eyebrow">{typeLabel}</p>
          <h1 className="mt-4 text-4xl font-extrabold text-ink sm:text-5xl">We&apos;ll get back within 48 hours.</h1>
          <p className="mt-4 text-lg text-slate">Keep this request ID for tracking updates and future communication.</p>
          <div className="mt-8 rounded-2xl border border-forest/10 bg-forest/5 px-8 py-6 text-4xl font-black tracking-wider text-forest shadow-inner">{requestId}</div>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link className="btn-primary" href="/">Back Home</Link>
            <Link className="btn-secondary" href="/track">Track Request</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
