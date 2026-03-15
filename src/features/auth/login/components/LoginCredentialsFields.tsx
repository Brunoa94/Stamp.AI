import { useState } from "react";
import { Button } from "@/features/ui/button";
import { FormField } from "@/features/ui/form-field";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { LoginI } from "@/schemas/auth";
import { InlinePasswordReset } from "../../passwordReset/InlinePasswordReset";

interface LoginCredentialsFieldsProps {
  register: UseFormRegister<LoginI>;
  errors: FieldErrors<LoginI>;
}

export function LoginCredentialsFields({
  register,
  errors,
}: LoginCredentialsFieldsProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <FormField
        id="email"
        label="Email"
        type="email"
        required
        placeholder="name@company.com"
        error={errors.email?.message}
        register={register("email")}
        variant="auth-login"
        leadingIcon={<Mail className="h-5 w-5" />}
      />

      <div className="space-y-2">
        <FormField
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          required
          placeholder="••••••••"
          register={register("password")}
          error={errors.password?.message}
          variant="auth-login"
          leadingIcon={<Lock className="h-5 w-5" />}
          trailingAction={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="h-7 w-7 rounded-full text-slate-400 hover:text-slate-600"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          }
        />

        <InlinePasswordReset buttonClassName="h-auto p-0 text-xs font-bold tracking-tight text-slate-400 hover:bg-transparent hover:text-primary" />
      </div>
    </>
  );
}
