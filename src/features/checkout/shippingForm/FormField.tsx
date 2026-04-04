import { Input } from "@/features/ui/input";
import { Label } from "@/features/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/ui/select";
import clsx from "clsx";
import {
  FieldError,
  UseFormRegister,
  Control,
  Controller,
} from "react-hook-form";
import { ShippingAddressT } from "@/schemas/checkout";

interface FormFieldProps {
  id: keyof ShippingAddressT;
  label: string;
  type?: string;
  required?: boolean;
  register: UseFormRegister<ShippingAddressT>;
  control: Control<ShippingAddressT>;
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
  control,
  error,
  options,
}: FormFieldProps) => {
  const errorId = error ? `${id}-error` : undefined;
  const labelClassName =
    "mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500";
  const inputClassName = clsx(
    "rounded-none border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-none focus-visible:ring-0 focus-visible:border-purple-500",
    error && "border-red-400",
  );

  // Render select dropdown with shadcn Select
  if (options) {
    return (
      <div>
        <Label htmlFor={id} className={labelClassName}>
          {label}
          {required && (
            <span className="text-red-600" aria-label="required">
              {" "}
              *
            </span>
          )}
        </Label>
        <Controller
          name={id}
          control={control}
          render={({ field }) => (
            <Select
              onValueChange={field.onChange}
              value={field.value as string}
            >
              <SelectTrigger
                id={id}
                aria-invalid={!!error}
                aria-describedby={errorId}
                className={inputClassName}
              >
                <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
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
          <p id={errorId} role="alert" className="text-red-600 text-xs mt-1">
            {error.message}
          </p>
        )}
      </div>
    );
  }

  // Render input field
  return (
    <div>
      <Label htmlFor={id} className={labelClassName}>
        {label}
        {required && (
          <span className="text-red-600" aria-label="required">
            {" "}
            *
          </span>
        )}
      </Label>
      <Input
        id={id}
        type={type}
        {...register(id)}
        aria-invalid={!!error}
        aria-describedby={errorId}
        className={inputClassName}
      />
      {error && (
        <p id={errorId} role="alert" className="text-red-600 text-xs mt-1">
          {error.message}
        </p>
      )}
    </div>
  );
};
