import { ArrowRight, BadgeCheck, Clock, MapPin, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { LandingNav } from "@/components/landing-nav";

const trust = [
  ["Verified Opportunities", ShieldCheck],
  ["Genuine Buyers & Sellers", Users],
  ["Local Experts", MapPin],
  ["Fast Response", Clock]
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen bg-kerala-wave">
      <section className="page-wrap pt-8">
        <header className="flex items-center justify-between gap-3 py-4">
          <Brand />
          <LandingNav />
        </header>

        <div className="kerala-hero mt-6 grid gap-10 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
          <div className="relative z-10">
            <p className="kerala-chip">
              <BadgeCheck size={16} className="text-gold" /> കോട്ടയം ,പാലാ , രാമപുരം ഏരിയയിൽ ആണെങ്കിൽ 24 മണിക്കൂറിനുള്ളിൽ മറുപടി
            </p>
            <h1 className="mt-5 text-5xl font-extrabold leading-tight sm:text-6xl">
              S N Homes
              <span className="block text-gold">Match. Visit. Move.</span>
            </h1>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Link href="/buy" className="group rounded-2xl border border-white/30 bg-white/15 p-6 backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/20">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Buy / Rent</span>
                <span className="mt-3 block text-2xl font-black">സ്ഥലം/വസ്തു ആവശ്യം ഉണ്ട് </span>
                <span className="mt-1 block text-sm text-white/80">Register Requirement</span>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white/90">
                  Get matched <ArrowRight className="transition group-hover:translate-x-1" size={18} />
                </span>
              </Link>
              <Link href="/sell" className="group rounded-2xl border border-white/30 bg-white/15 p-6 backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/20">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Sell Property</span>
                <span className="mt-3 block text-2xl font-black">സ്ഥലം/വസ്തു വിൽക്കാൻ ഉണ്ട് </span>
                <span className="mt-1 block text-sm text-white/80">Get Verified Buyers</span>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white/90">
                  Submit property <ArrowRight className="transition group-hover:translate-x-1" size={18} />
                </span>
              </Link>
            </div>
          </div>
          

          <aside className="relative z-10 space-y-4">
            <div className="rounded-2xl border border-white/30 bg-white/95 p-6 text-ink shadow-soft">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-leaf">Live Promise</p>
              <p className="mt-2 text-5xl font-black text-forest">48 Hrs*</p>
              <p className="mt-1 text-xs font-medium text-slate/80">*if matching properties/buyers are available</p>
              <p className="mt-2 text-sm font-semibold text-slate">We push qualified property matches quickly through our CRM workflow.</p>
            </div>
            <div className="rounded-2xl border border-white/30 bg-white/10 p-6 text-white backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold">Hot Zones</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide text-white/95">
                {["Kottayam", "Eranakulam", "Ramapuram", "Thodupuzha", "Pala", "Idukki"].map((zone) => (
                  <span key={zone} className="rounded-full border border-white/35 px-3 py-1.5">
                    {zone}
                  </span>
                ))}
              </div>
            </div>
            <p className="px-1 text-sm font-medium leading-relaxed text-white/85">
              Designed for Kerala market behavior: locality-first screening, verified lead quality, and fast follow-up loops. 
            </p>
          </aside>
        </div>
      </section>

      <section className="page-wrap py-16">
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            ["1", "Capture", "Leads from buyers and sellers are verified before entering CRM."],
            ["2", "Match", "Locality, budget, and timeline signals drive shortlist quality."],
            ["3", "Close", "Followups and visits are tracked end-to-end for faster closure."]
          ].map(([step, title, description]) => (
            <article key={step} className="surface-card p-6">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-leaf">Step {step}</p>
              <h2 className="mt-2 text-2xl font-black text-ink">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-wrap pb-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {trust.map(([label, Icon]) => (
            <div key={label} className="surface-card p-8 text-center transition hover:-translate-y-1 hover:shadow-soft">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-forest/5 text-forest">
                <Icon size={32} strokeWidth={1.5} />
              </div>
              <p className="mt-5 text-sm font-black uppercase tracking-wide text-ink">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-cloud bg-white px-5 py-10">
        <div className="page-wrap flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-6 text-sm font-semibold text-slate">
            <Link className="transition hover:text-forest" href="/track">Track</Link>
            <Link className="transition hover:text-forest" href="/admin/login">Admin</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
