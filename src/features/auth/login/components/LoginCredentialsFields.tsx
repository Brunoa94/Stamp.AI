import { useState } from "react";
import { Button } from "@/features/ui/button";
import { FormField } from "@/features/ui/form-field";
import { Span } from "@/features/ui/span";
import { Input } from "@/features/ui/input";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { LoginI } from "@/schemas/auth";
import { InlinePasswordReset } from "../../passwordReset/InlinePasswordReset";

interface PropsI {
  register: UseFormRegister<LoginI>;
  errors: FieldErrors<LoginI>;
}

export function LoginCredentialsFields({
  register,
  errors,
}: PropsI) {
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

      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="password" className="flex items-center">
            <Span variant="default" className="text-ink">
              Password
            </Span>
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          </label>
          <InlinePasswordReset className="ml-auto" />
        </div>

        <div className="relative space-y-2">
          <div className="relative">
            <div className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-ink/30">
              <Lock className="h-5 w-5" />
            </div>

            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              className="h-14 rounded-2xl border-ink/5 bg-concrete/50 font-medium text-ink placeholder:text-ink/20 focus-visible:border-cyan focus-visible:ring-4 focus-visible:ring-cyan/15 pl-14 pr-14"
              {...register("password")}
            />

            <div className="absolute right-5 top-1/2 -translate-y-1/2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="h-7 w-7 rounded-full text-ink/30 hover:text-ink hover:bg-transparent transition-colors"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {errors.password?.message && (
            <p
              id="password-error"
              role="alert"
              className="text-sm text-red-600 dark:text-red-400"
            >
              {errors.password.message}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
