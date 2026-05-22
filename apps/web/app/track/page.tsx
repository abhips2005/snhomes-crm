"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { trackRequestSchema, type TrackRequestInput } from "@snh/types";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Field } from "@/components/form-field";
import { PageShell } from "@/components/page-shell";
import { trackRequest } from "@/lib/api";

export default function TrackPage() {
  const form = useForm<TrackRequestInput>({ resolver: zodResolver(trackRequestSchema) });
  const mutation = useMutation({ mutationFn: trackRequest });

  return (
    <PageShell>
      <section className="page-wrap py-10">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="rounded-3xl border border-forest/10 bg-gradient-to-br from-forest to-[#2b705f] p-8 text-white shadow-soft">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Track Request</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight">Real-time status updates.</h1>
            <p className="mt-4 text-sm leading-relaxed text-white/90">
              Enter your request details to see latest progress from our internal matching, followup, and visit pipeline.
            </p>
          </aside>

          <div>
            <form className="surface-card grid gap-6 rounded-3xl p-8" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <Field label="Phone" error={form.formState.errors.phone}>
            <input className="field" inputMode="tel" {...form.register("phone")} />
          </Field>
          <Field label="Request ID" error={form.formState.errors.request_id}>
            <input className="field uppercase" placeholder="SNH-000001" {...form.register("request_id")} />
          </Field>
          <button className="btn-primary" disabled={mutation.isPending}>
            {mutation.isPending ? "Checking..." : "Track"}
          </button>
            </form>
            {mutation.data ? (
              <div className="mt-6 rounded-3xl border border-forest/20 bg-gradient-to-r from-forest to-leaf p-8 text-white shadow-soft">
                <p className="text-sm font-bold tracking-wider text-gold/95">{mutation.data.request_id}</p>
                <p className="mt-3 text-4xl font-black">{mutation.data.status}</p>
                <p className="mt-3 text-lg text-white/85">Hi {mutation.data.name}, your {mutation.data.type} request is in progress.</p>
              </div>
            ) : null}
            {mutation.error ? <p className="mt-4 text-sm font-semibold text-ember">{mutation.error.message}</p> : null}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
