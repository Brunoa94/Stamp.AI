import { Label } from "@/features/ui/label";
import { Input } from "@/features/ui/input";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

type FormFieldVariant = "default" | "auth-login" | "auth-register" | "shipping" | "profile" | "profile-readonly" | "stamp-auth";

// Exported input styles for direct use in components with controlled inputs
export const profileInputStyles = {
  editable:
    "h-12 border-2 border-(--color-stamp-divider) bg-(--color-stamp-cream) px-5 text-sm uppercase tracking-[0.05em] text-(--color-stamp-chocolate) placeholder:text-(--color-stamp-taupe)/50 focus-visible:border-(--color-stamp-gold) focus-visible:ring-2 focus-visible:ring-(--color-stamp-gold)/20",
  readonly:
    "h-12 border-2 border-(--color-stamp-divider) bg-(--color-stamp-cream) px-5 text-sm uppercase tracking-[0.05em] text-(--color-stamp-chocolate) outline-none cursor-not-allowed opacity-60",
  password:
    "h-12 border-2 border-(--color-stamp-divider) bg-(--color-stamp-cream) px-5 text-sm uppercase tracking-[0.05em] text-(--color-stamp-chocolate) placeholder:text-(--color-stamp-taupe)/50 focus-visible:border-(--color-stamp-gold) focus-visible:ring-2 focus-visible:ring-(--color-stamp-gold)/20",
};

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
  { container: string; labelVariant?: "sm" | "default"; labelColor: string; input: string }
> = {
  default: {
    container: "space-y-2",
    labelColor: "",
    input: "",
  },
  "auth-login": {
    container: "space-y-2",
    labelVariant: "default",
    labelColor: "text-ink",
    input:
      "h-14 rounded-2xl border-ink/5 bg-concrete/50 font-medium text-ink placeholder:text-ink/20 focus-visible:border-cyan focus-visible:ring-4 focus-visible:ring-cyan/15",
  },
  "auth-register": {
    container: "",
    labelColor: "mb-2 ml-1 block text-slate-700",
    input:
      "h-12 rounded-xl border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400",
  },
  shipping: {
    container: "",
    labelColor: "mb-2 block text-slate-500",
    input:
      "rounded-none border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-none focus-visible:ring-0 focus-visible:border-purple-500",
  },
  profile: {
    container: "space-y-2",
    labelVariant: "sm" as const,
    labelColor: "text-(--color-stamp-chocolate)",
    input:
      "h-12 border-2 border-(--color-stamp-divider) bg-(--color-stamp-cream) px-5 text-sm uppercase tracking-[0.05em] text-(--color-stamp-chocolate) placeholder:text-(--color-stamp-taupe)/50 focus-visible:border-(--color-stamp-gold) focus-visible:ring-2 focus-visible:ring-(--color-stamp-gold)/20",
  },
  "profile-readonly": {
    container: "space-y-2",
    labelVariant: "sm" as const,
    labelColor: "text-(--color-stamp-chocolate)",
    input:
      "h-12 border-2 border-(--color-stamp-divider) bg-(--color-stamp-cream) px-5 text-sm uppercase tracking-[0.05em] text-(--color-stamp-chocolate) outline-none cursor-not-allowed opacity-60",
  },
  "stamp-auth": {
    container: "space-y-2",
    labelVariant: "sm" as const,
    labelColor: "text-(--color-stamp-chocolate)",
    input:
      "h-12 border-2 border-(--color-stamp-divider) bg-(--color-stamp-cream) px-5 text-sm uppercase tracking-[0.05em] text-(--color-stamp-chocolate) placeholder:text-(--color-stamp-taupe)/50 focus-visible:border-(--color-stamp-gold) focus-visible:ring-2 focus-visible:ring-(--color-stamp-gold)/20",
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
      {styles.labelVariant ? (
        <Label htmlFor={id} className="flex items-center">
          <Span variant={styles.labelVariant} className={styles.labelColor}>
            {label}
          </Span>
          {required && (
            <span className={variant === "stamp-auth" || variant === "profile" || variant === "profile-readonly" ? "text-(--color-stamp-gold) ml-1" : "text-red-500 ml-1"} aria-hidden="true">
              *
            </span>
          )}
        </Label>
      ) : (
        <Label htmlFor={id} className={styles.labelColor}>
          {label}
          {required && (
            <span className={variant === "stamp-auth" || variant === "profile" || variant === "profile-readonly" ? "text-(--color-stamp-gold)" : "text-red-500"} aria-hidden="true">
              {" "}
              *
            </span>
          )}
        </Label>
      )}

      {hasIcons ? (
        <div className="relative">
          {leadingIcon && (
            <div className={cn(
              "pointer-events-none absolute left-5 top-1/2 -translate-y-1/2",
              variant === "stamp-auth" || variant === "profile" || variant === "profile-readonly" ? "text-(--color-stamp-taupe)" : "text-ink/30"
            )}>
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
              leadingIcon && "pl-14",
              trailingAction && "pr-14",
              error && (variant === "stamp-auth" || variant === "profile" || variant === "profile-readonly" ? "border-(--color-stamp-error)" : "border-red-400")
            )}
            {...register}
          />

          {trailingAction && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2">
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
          className={cn(styles.input, error && (variant === "stamp-auth" || variant === "profile" || variant === "profile-readonly" ? "border-(--color-stamp-error)" : "border-red-400"))}
          {...register}
        />
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          className={cn(
            variant === "stamp-auth" || variant === "profile" || variant === "profile-readonly"
              ? "text-xs font-bold uppercase tracking-widest text-(--color-stamp-error)"
              : "text-sm text-red-600 dark:text-red-400",
            (variant === "auth-register" || variant === "shipping") && "mt-1"
          )}
        >
          {error}
        </p>
      )}
    </div>
  );
}
