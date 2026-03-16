import { FormField } from "@/features/ui/form-field";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { RegisterI } from "@/schemas/auth";

interface RegisterCredentialsFieldsProps {
  register: UseFormRegister<RegisterI>;
  errors: FieldErrors<RegisterI>;
}

export function RegisterCredentialsFields({
  register,
  errors,
}: RegisterCredentialsFieldsProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormField
          id="firstName"
          label="First Name"
          placeholder="John"
          error={errors.firstName?.message}
          register={register("firstName")}
          variant="auth-register"
        />

        <FormField
          id="lastName"
          label="Last Name"
          placeholder="Doe"
          error={errors.lastName?.message}
          register={register("lastName")}
          variant="auth-register"
        />
      </div>

      <FormField
        id="email"
        label="Email Address"
        type="email"
        placeholder="john@example.com"
        error={errors.email?.message}
        register={register("email")}
        variant="auth-register"
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <FormField
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          register={register("password")}
          variant="auth-register"
        />

        <FormField
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          register={register("confirmPassword")}
          variant="auth-register"
        />
      </div>
    </div>
  );
}
