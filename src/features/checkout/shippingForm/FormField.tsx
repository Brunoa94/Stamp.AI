import { Input } from "@/features/ui/input";
import { componentThemes } from "@/theme/components";
import clsx from "clsx";
import { FieldError, UseFormRegister } from "react-hook-form";
import { ShippingAddressT } from "@/schemas/checkout";

interface FormFieldProps {
  id: keyof ShippingAddressT;
  label: string;
  type?: string;
  required?: boolean;
  register: UseFormRegister<ShippingAddressT>;
  error?: FieldError;
  options?: { value: string; label: string }[];
}

/**
 * Reusable form field component with validation and accessibility
 */
export const FormField = ({
  id,
  label,
  type = "text",
  required = false,
  register,
  error,
  options,
}: FormFieldProps) => {
  const errorId = error ? `${id}-error` : undefined;

  // Render select dropdown
  if (options) {
    return (
      <div>
        <label htmlFor={id} className={componentThemes.text.label}>
          {label}
          {required && (
            <span className="text-red-600" aria-label="required">
              *
            </span>
          )}
        </label>
        <select
          id={id}
          {...register(id)}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={clsx(componentThemes.input.base, {
            [componentThemes.input.error]: error,
          })}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={errorId} role="alert" className="text-red-600 text-sm mt-1">
            {error.message}
          </p>
        )}
      </div>
    );
  }

  // Render input field
  return (
    <div>
      <label htmlFor={id} className={componentThemes.text.label}>
        {label}
        {required && (
          <span className="text-red-600" aria-label="required">
            *
          </span>
        )}
      </label>
      <Input
        id={id}
        type={type}
        {...register(id)}
        aria-invalid={!!error}
        aria-describedby={errorId}
        className={clsx(componentThemes.input.base, {
          [componentThemes.input.error]: error,
        })}
      />
      {error && (
        <p id={errorId} role="alert" className="text-red-600 text-sm mt-1">
          {error.message}
        </p>
      )}
    </div>
  );
};
