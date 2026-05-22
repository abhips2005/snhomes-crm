import type { FieldError } from "react-hook-form";

type Option = { label: string; value: string };

type FieldProps = {
  label: string;
  error?: FieldError;
  children: React.ReactNode;
};

export function Field({ label, error, children }: FieldProps) {
  return (
    <label className="grid gap-2">
      <span className="label">{label}</span>
      {children}
      {error?.message ? <span className="text-xs font-semibold text-ember">{error.message}</span> : <span className="h-[0.65rem]" />}
    </label>
  );
}

export function SelectField({
  label,
  error,
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & Omit<FieldProps, "children"> & { options: Option[] }) {
  return (
    <Field label={label} error={error}>
      <select className="field" {...props}>
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
