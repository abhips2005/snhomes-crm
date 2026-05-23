"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DISTRICTS, PROPERTY_TYPES, TIMELINES, buyLeadSchema, type BuyLeadInput } from "@snh/types";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Field, SelectField } from "@/components/form-field";
import { PageShell } from "@/components/page-shell";
import { submitBuyLead } from "@/lib/api";

export default function BuyPage() {
  const router = useRouter();
  const form = useForm<BuyLeadInput>({
    resolver: zodResolver(buyLeadSchema),
    defaultValues: { timeline: "immediately", property_type: "house" }
  });
  const mutation = useMutation({
    mutationFn: submitBuyLead,
    onSuccess: ({ request_id }) => router.push(`/success?requestId=${request_id}&type=requirement`)
  });

  return (
    <PageShell>
      <section className="page-wrap py-10">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="rounded-3xl border border-forest/10 bg-gradient-to-br from-forest to-leaf p-8 text-white shadow-soft">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Buy / Rent</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight">Find the right home, faster.</h1>
            <p className="mt-4 text-sm leading-relaxed text-white/90">
              Share requirement details and our Kerala team will connect matched options from verified listings and owner leads.
            </p>
            <div className="mt-8 space-y-3 text-sm font-semibold text-white/90">
              <p>താഴെ കൊടുത്തിരിക്കുന്ന ഫോം സമർപ്പിച്ചു 48 മണിക്കൂറിനകം ഞങ്ങൾ നിങ്ങളുമായി ബന്ധപ്പെടുന്നതാണ്.</p>
              <p>കോട്ടയം ,പാലാ , രാമപുരം ഏരിയയിൽ ആണെങ്കിൽ 24 മണിക്കൂറിനുള്ളിൽ മറുപടി</p>
            </div>
          </aside>

          <form className="surface-card grid gap-6 rounded-3xl p-8 sm:grid-cols-2" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <Field label="Name (പേര്)" error={form.formState.errors.name}>
            <input className="field" {...form.register("name")} />
          </Field>
          <Field label="Phone (മൊബൈൽ നം)" error={form.formState.errors.phone}>
            <input className="field" inputMode="tel" {...form.register("phone")} />
          </Field>
          <SelectField label="District (ജില്ല)" error={form.formState.errors.district} options={DISTRICTS.map((value) => ({ label: value, value }))} {...form.register("district")} />
          <Field label="Locality (സ്ഥലം)" error={form.formState.errors.locality}>
            <input className="field" {...form.register("locality")} />
          </Field>
          <SelectField label="Property Type (വസ്തുവിന്റെ തരം)" error={form.formState.errors.property_type} options={PROPERTY_TYPES.map((value) => ({ label: value, value }))} {...form.register("property_type")} />
          <Field label="Preferred Pincode (പിന്കോഡ്) (optional)" error={form.formState.errors.preferred_pincode}>
            <input className="field" inputMode="numeric" {...form.register("preferred_pincode")} />
          </Field>
          <Field label="Budget Min (കുറഞ്ഞ വില)" error={form.formState.errors.budget_min}>
            <input className="field" type="number" {...form.register("budget_min")} />
          </Field>
          <Field label="Budget Max (പരമാവധി വില)" error={form.formState.errors.budget_max}>
            <input className="field" type="number" {...form.register("budget_max")} />
          </Field>
          <SelectField label="Timeline (വാങ്ങാൻ ഉദ്ദേശിക്കുന്ന സമയം)" error={form.formState.errors.timeline} options={TIMELINES.map((value) => ({ label: value, value }))} {...form.register("timeline")} />
          <Field label="Notes (വിവരങ്ങൾ)" error={form.formState.errors.notes}>
            <textarea className="field min-h-28" {...form.register("notes")} />
          </Field>
          {mutation.error ? <p className="text-sm font-semibold text-ember sm:col-span-2">{mutation.error.message}</p> : null}
          <button className="btn-primary sm:col-span-2" disabled={mutation.isPending}>
            {mutation.isPending ? "Submitting..." : "Submit Requirement"}
          </button>
          </form>
        </div>
      </section>
    </PageShell>
  );
}
