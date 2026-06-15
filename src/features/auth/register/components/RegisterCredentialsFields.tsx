import { FormField } from "@/features/ui/form-field";
import { Mail, Lock, User } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { RegisterI } from "@/schemas/auth";

interface PropsI {
  register: UseFormRegister<RegisterI>;
  errors: FieldErrors<RegisterI>;
}

export function RegisterCredentialsFields({
  register,
  errors,
}: PropsI) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          id="firstName"
          label="First Name"
          placeholder="John"
          required
          error={errors.firstName?.message}
          register={register("firstName")}
          variant="auth-login"
          leadingIcon={<User className="h-5 w-5" />}
        />

        <FormField
          id="lastName"
          label="Last Name"
          placeholder="Doe"
          required
          error={errors.lastName?.message}
          register={register("lastName")}
          variant="auth-login"
          leadingIcon={<User className="h-5 w-5" />}
        />
      </div>

      <FormField
        id="email"
        label="Email Address"
        type="email"
        placeholder="name@company.com"
        required
        error={errors.email?.message}
        register={register("email")}
        variant="auth-login"
        leadingIcon={<Mail className="h-5 w-5" />}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          required
          error={errors.password?.message}
          register={register("password")}
          variant="auth-login"
          leadingIcon={<Lock className="h-5 w-5" />}
        />

        <FormField
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          required
          error={errors.confirmPassword?.message}
          register={register("confirmPassword")}
          variant="auth-login"
          leadingIcon={<Lock className="h-5 w-5" />}
        />
      </div>
    </div>
  );
}
