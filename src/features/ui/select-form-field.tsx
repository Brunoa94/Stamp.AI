import { Label } from "@/features/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/ui/select";
import { cn } from "@/lib/utils";
import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";

type SelectFormFieldVariant = "default" | "shipping";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFormFieldProps<T extends FieldValues = FieldValues> {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  control: Control<T>;
  options: SelectOption[];
  variant?: SelectFormFieldVariant;
  placeholder?: string;
}

const variantStyles: Record<
  SelectFormFieldVariant,
  { container: string; label: string; input: string }
> = {
  default: {
    container: "space-y-2",
    label: "",
    input: "",
  },
  shipping: {
    container: "",
    label: "mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500",
    input:
      "rounded-none border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-none focus-visible:ring-0 focus-visible:border-purple-500",
  },
};

export function SelectFormField<T extends FieldValues = FieldValues>({
  id,
  label,
  required = false,
  error,
  control,
  options,
  variant = "default",
  placeholder,
}: SelectFormFieldProps<T>) {
  const errorId = error ? `${id}-error` : undefined;
  const styles = variantStyles[variant];

  return (
    <div className={styles.container}>
      <Label htmlFor={id} className={styles.label}>
        {label}
        {required && (
          <span className="text-red-500" aria-label="required">
            {" "}
            *
          </span>
        )}
      </Label>
      <Controller
        name={id as Path<T>}
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} value={field.value as string}>
            <SelectTrigger
              id={id}
              aria-invalid={!!error}
              aria-describedby={errorId}
              className={cn(styles.input, error && "border-red-400")}
            >
              <SelectValue
                placeholder={placeholder ?? `Select ${label.toLowerCase()}`}
              />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {error && (
        <p
          id={errorId}
          role="alert"
          className={cn(
            "text-sm text-red-600 dark:text-red-400",
            variant === "shipping" && "mt-1"
          )}
        >
          {error}
        </p>
      )}
    </div>
  );
}
