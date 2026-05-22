"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DISTRICTS, PROPERTY_TYPES, sellLeadSchema, type SellLeadInput } from "@snh/types";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Field, SelectField } from "@/components/form-field";
import { PageShell } from "@/components/page-shell";
import { submitSellLead } from "@/lib/api";

export default function SellPage() {
  const router = useRouter();
  const form = useForm<SellLeadInput>({
    resolver: zodResolver(sellLeadSchema),
    defaultValues: { property_type: "house" }
  });
  const mutation = useMutation({
    mutationFn: submitSellLead,
    onSuccess: ({ request_id }) => router.push(`/success?requestId=${request_id}&type=property`)
  });

  return (
    <PageShell>
      <section className="page-wrap py-10">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="rounded-3xl border border-forest/10 bg-gradient-to-br from-[#204a3b] to-forest p-8 text-white shadow-soft">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Sell Property</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight">List with confidence.</h1>
            <p className="mt-4 text-sm leading-relaxed text-white/90">
              We profile your property, verify buyer seriousness, and track each conversation inside S N Homes CRM.
            </p>
            <div className="mt-8 space-y-3 text-sm font-semibold text-white/90">
              <p>1. Submit property details</p>
              <p>2. Get qualified buyer matches</p>
              <p>3. Monitor progress till closure</p>
            </div>
          </aside>

          <form className="surface-card grid gap-6 rounded-3xl p-8 sm:grid-cols-2" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <Field label="Name" error={form.formState.errors.name}>
            <input className="field" {...form.register("name")} />
          </Field>
          <Field label="Phone" error={form.formState.errors.phone}>
            <input className="field" inputMode="tel" {...form.register("phone")} />
          </Field>
          <SelectField label="District" error={form.formState.errors.district} options={DISTRICTS.map((value) => ({ label: value, value }))} {...form.register("district")} />
          <Field label="Locality" error={form.formState.errors.locality}>
            <input className="field" {...form.register("locality")} />
          </Field>
          <Field label="Pincode" error={form.formState.errors.pincode}>
            <input className="field" inputMode="numeric" {...form.register("pincode")} />
          </Field>
          <SelectField label="Property Type" error={form.formState.errors.property_type} options={PROPERTY_TYPES.map((value) => ({ label: value, value }))} {...form.register("property_type")} />
          <Field label="Asking Price" error={form.formState.errors.asking_price}>
            <input className="field" type="number" {...form.register("asking_price")} />
          </Field>
          <Field label="Photos (optional)">
            <input className="field" type="file" multiple accept="image/*" disabled title="Supabase storage hook placeholder for V1" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes / Details" error={form.formState.errors.notes}>
              <textarea className="field min-h-32" {...form.register("notes")} />
            </Field>
          </div>
          {mutation.error ? <p className="text-sm font-semibold text-ember sm:col-span-2">{mutation.error.message}</p> : null}
          <button className="btn-primary sm:col-span-2" disabled={mutation.isPending}>
            {mutation.isPending ? "Submitting..." : "Submit Property"}
          </button>
          </form>
        </div>
      </section>
    </PageShell>
  );
}
