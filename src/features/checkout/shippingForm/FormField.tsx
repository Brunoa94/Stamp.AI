import { Input } from "@/features/ui/input";
import { Label } from "@/features/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/features/ui/select";
import { componentThemes } from "@/theme/components";
import clsx from "clsx";
import { FieldError, UseFormRegister, Control, Controller } from "react-hook-form";
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

  // Render select dropdown with shadcn Select
  if (options) {
    return (
      <div>
        <Label htmlFor={id} className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && (
            <span className="text-red-600" aria-label="required">
              {" "}*
            </span>
          )}
        </Label>
        <Controller
          name={id}
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value as string}>
              <SelectTrigger
                id={id}
                aria-invalid={!!error}
                aria-describedby={errorId}
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
          <p id={errorId} role="alert" className="text-red-600 dark:text-red-400 text-sm mt-1">
            {error.message}
          </p>
        )}
      </div>
    );
  }

  // Render input field
  return (
    <div>
      <Label htmlFor={id} className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && (
          <span className="text-red-600" aria-label="required">
            {" "}*
          </span>
        )}
      </Label>
      <Input
        id={id}
        type={type}
        {...register(id)}
        aria-invalid={!!error}
        aria-describedby={errorId}
      />
      {error && (
        <p id={errorId} role="alert" className="text-red-600 dark:text-red-400 text-sm mt-1">
          {error.message}
        </p>
      )}
    </div>
  );
};
