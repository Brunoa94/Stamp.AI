import { Label } from "@/features/ui/label";
import { Input } from "@/features/ui/input";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

type FormFieldVariant = "default" | "auth-login" | "auth-register";

interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  register: UseFormRegisterReturn;
  variant?: FormFieldVariant;
  leadingIcon?: ReactNode;
  trailingAction?: ReactNode;
}

const variantStyles: Record<
  FormFieldVariant,
  { container: string; label: string; input: string }
> = {
  default: {
    container: "space-y-2",
    label: "",
    input: "",
  },
  "auth-login": {
    container: "space-y-2",
    label: "ml-1 text-sm font-bold text-slate-700",
    input:
      "h-14 rounded-2xl border-slate-200 bg-white font-medium text-slate-900 placeholder:text-slate-400",
  },
  "auth-register": {
    container: "",
    label:
      "mb-2 ml-1 block text-xs font-bold uppercase tracking-widest text-slate-700",
    input:
      "h-12 rounded-xl border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400",
  },
};

export function FormField({
  id,
  label,
  type = "text",
  placeholder,
  required = false,
  error,
  register,
  variant = "default",
  leadingIcon,
  trailingAction,
}: FormFieldProps) {
  const errorId = error ? `${id}-error` : undefined;
  const styles = variantStyles[variant];
  const hasIcons = leadingIcon || trailingAction;

  return (
    <div className={styles.container}>
      <Label htmlFor={id} className={styles.label}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {hasIcons ? (
        <div className="relative">
          {leadingIcon && (
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              {leadingIcon}
            </div>
          )}

          <Input
            id={id}
            type={type}
            placeholder={placeholder}
            aria-invalid={!!error}
            aria-describedby={errorId}
            className={cn(
              styles.input,
              leadingIcon && "pl-12",
              trailingAction && "pr-12"
            )}
            {...register}
          />

          {trailingAction && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {trailingAction}
            </div>
          )}
        </div>
      ) : (
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={styles.input}
          {...register}
        />
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          className={cn(
            "text-sm text-red-600 dark:text-red-400",
            variant === "auth-register" && "mt-1"
          )}
        >
          {error}
        </p>
      )}
    </div>
  );
}
