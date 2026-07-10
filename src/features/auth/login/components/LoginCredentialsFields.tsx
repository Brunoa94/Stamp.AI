import { useState } from "react";
import { Button } from "@/features/ui/button";
import { FormField } from "@/features/ui/form-field";
import { Span } from "@/features/ui/span";
import { Label } from "@/features/ui/label";
import { Input } from "@/features/ui/input";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { LoginI } from "@/schemas/auth";
import { InlinePasswordReset } from "../../passwordReset/InlinePasswordReset";

interface PropsI {
  register: UseFormRegister<LoginI>;
  errors: FieldErrors<LoginI>;
}

export function LoginCredentialsFields({ register, errors }: PropsI) {
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
        variant="stamp-auth"
        leadingIcon={<Mail className="h-5 w-5" />}
      />

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="password" className="flex items-center">
            <Span variant="default" className="text-(--color-stamp-chocolate)">
              Password
            </Span>
            <span className="text-(--color-stamp-gold) ml-1" aria-hidden="true">
              *
            </span>
          </Label>
          <InlinePasswordReset className="ml-auto" />
        </div>

        <div className="relative space-y-2">
          <div className="relative">
            <div className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-(--color-stamp-taupe)">
              <Lock className="h-5 w-5" />
            </div>

            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              className="h-14 border-2 border-(--color-stamp-divider) bg-(--color-stamp-cream) px-5 text-xl uppercase tracking-[0.05em] text-(--color-stamp-chocolate) placeholder:text-(--color-stamp-taupe)/50 focus-visible:border-(--color-stamp-gold) focus-visible:ring-2 focus-visible:ring-(--color-stamp-gold)/20 pl-14 pr-14"
              {...register("password")}
            />

            <div className="absolute right-5 top-1/2 -translate-y-1/2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="h-7 w-7 text-(--color-stamp-taupe) hover:text-(--color-stamp-chocolate) hover:bg-transparent transition-colors"
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
              className="text-lg font-bold uppercase tracking-widest text-(--color-stamp-error)"
            >
              {errors.password.message}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
