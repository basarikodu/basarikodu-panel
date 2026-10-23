import { cn } from "cn";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FieldProps = {
  name: string;
  label: string;
  hint?: string;
  className?: string;
};

export function TextField({
  name,
  label,
  hint,
  className,
  ...input
}: FieldProps & Omit<React.ComponentProps<"input">, "name">) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={name}>
        {label}
        {input.required && <span className="text-destructive">*</span>}
      </Label>
      <Input id={name} name={name} {...input} />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function TextAreaField({
  name,
  label,
  hint,
  className,
  ...input
}: FieldProps & Omit<React.ComponentProps<"textarea">, "name">) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={name}>{label}</Label>
      <Textarea id={name} name={name} {...input} />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Yerel <select>: formlarla sorunsuz çalışır, mobilde sistem seçicisini açar. */
export function SelectField({
  name,
  label,
  hint,
  className,
  options,
  placeholder,
  ...select
}: FieldProps & {
  options: { value: string; label: string }[];
  placeholder?: string;
} & Omit<React.ComponentProps<"select">, "name">) {
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={name}>
        {label}
        {select.required && <span className="text-destructive">*</span>}
      </Label>
      <select
        id={name}
        name={name}
        className="field-select h-11 w-full appearance-none rounded-[12px] border border-input bg-card pr-10 pl-3.5 text-base shadow-xs transition-[color,box-shadow,border-color] outline-none hover:border-primary/30 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        {...select}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Çoklu seçim: aynı name ile birden fazla checkbox (FormData.getAll). */
export function CheckboxGroupField({
  name,
  label,
  options,
  defaultValues = [],
}: {
  name: string;
  label: string;
  options: { value: string; label: string; color?: string }[];
  defaultValues?: string[];
}) {
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.value}
            className="flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-accent has-[:checked]:text-primary"
          >
            <input
              type="checkbox"
              name={name}
              value={o.value}
              defaultChecked={defaultValues.includes(o.value)}
              className="accent-primary"
            />
            {o.color && <span className="size-2 rounded-full" style={{ background: o.color }} />}
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
