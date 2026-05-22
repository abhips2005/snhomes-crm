"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Brand } from "@/components/brand";
import { createClient } from "@/lib/supabase";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const result = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    router.replace(searchParams.get("next") ?? "/admin");
    router.refresh();
  }

  return (
    <main className="grid min-h-[calc(100vh-3rem)] place-items-center px-5 py-8">
      <section className="w-full max-w-5xl overflow-hidden rounded-3xl border border-cloud/80 bg-white shadow-card">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
          <aside className="hidden bg-gradient-to-br from-forest via-leaf to-[#39ad8d] p-8 text-white lg:block">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">S N Homes</p>
            <h2 className="mt-4 text-4xl font-extrabold leading-tight">Welcome back, Admin.</h2>
            <p className="mt-4 text-sm leading-relaxed text-white/85">
              Manage leads, matching, followups, visits, and reporting from one modern CRM workspace built for field and office teams.
            </p>
            <div className="mt-8 space-y-3 text-sm font-semibold text-white/90">
              <p>Track high-intent buyers and sellers</p>
              <p>Prioritize hot leads with match scores</p>
              <p>Drive faster closures with followup workflow</p>
            </div>
          </aside>

          <form onSubmit={submit} className="p-6 sm:p-10">
            <Brand />
            <h1 className="mt-8 text-3xl font-extrabold text-ink">Admin Login</h1>
            <p className="mt-2 text-sm text-slate">Use your authorized account credentials.</p>
            <label className="mt-6 grid gap-2">
              <span className="label">Email</span>
              <input className="field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label className="mt-4 grid gap-2">
              <span className="label">Password</span>
              <input className="field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </label>
            {error ? <p className="mt-4 rounded-lg border border-ember/20 bg-ember/5 px-3 py-2 text-sm font-semibold text-ember">{error}</p> : null}
            <button className="btn-primary mt-6 w-full rounded-xl" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
