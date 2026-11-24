import { Label } from "@/features/ui/label";
import { Input } from "@/features/ui/input";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

type FormFieldVariant = "default" | "auth-login" | "auth-register" | "shipping" | "profile" | "profile-readonly" | "stamp-auth";

// Exported input styles for direct use in components with controlled inputs.
// The Input atom carries the stamp field look (rounded-lg, cream surface,
// divider border, chocolate focus); these only add the per-state differences.
export const profileInputStyles = {
  editable: "",
  readonly: "cursor-default",
  password: "",
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

/**
 * Every variant shares one field look (the Input atom), one label style and
 * one error style, so forms read the same across auth, checkout and profile.
 * The variant names stay for the callers; only the read-only field differs.
 */
const variantInputStyles: Record<FormFieldVariant, string> = {
  default: "",
  "auth-login": "",
  "auth-register": "",
  shipping: "",
  profile: profileInputStyles.editable,
  "profile-readonly": profileInputStyles.readonly,
  "stamp-auth": "",
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
  const hasIcons = leadingIcon || trailingAction;
  const input = (
    <Input
      id={id}
      type={type}
      placeholder={placeholder}
      aria-invalid={!!error}
      aria-describedby={errorId}
      className={cn(
        variantInputStyles[variant],
        leadingIcon && "pl-14",
        trailingAction && "pr-14",
      )}
      {...register}
    />
  );

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && (
          <Span unstyled className="text-(--color-stamp-gold-text)" aria-hidden="true">
            *
          </Span>
        )}
      </Label>

      {hasIcons ? (
        <div className="relative">
          {leadingIcon && (
            <div className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-(--color-stamp-taupe)">
              {leadingIcon}
            </div>
          )}

          {input}

          {trailingAction && (
            <div className="absolute right-5 top-1/2 -translate-y-1/2">
              {trailingAction}
            </div>
          )}
        </div>
      ) : (
        input
      )}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-sm font-medium text-(--color-stamp-error)"
        >
          {error}
        </p>
      )}
    </div>
  );
}
