import { useState } from "react";
import { Button } from "@/features/ui/button";
import { FormField } from "@/features/ui/form-field";
import { Span } from "@/features/ui/span";
import { Paragraph } from "@/features/ui/paragraph";
import { Label } from "@/features/ui/label";
import { Input } from "@/features/ui/input";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { LoginI } from "@/shared/schemas/auth";
import { useValidationMessage } from "@/shared/hooks/useValidationMessage";
import { InlinePasswordReset } from "../../passwordReset/InlinePasswordReset";

interface PropsI {
  register: UseFormRegister<LoginI>;
  errors: FieldErrors<LoginI>;
}

export function LoginCredentialsFields({ register, errors }: PropsI) {
  const [showPassword, setShowPassword] = useState(false);
  const t = useTranslations("auth.login.fields");
  const ve = useValidationMessage();

  return (
    <>
      <FormField
        id="email"
        label={t("emailLabel")}
        type="email"
        required
        placeholder={t("emailPlaceholder")}
        error={ve(errors.email?.message)}
        register={register("email")}
        variant="stamp-auth"
        leadingIcon={<Mail className="h-5 w-5" />}
      />

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="password">
            {t("passwordLabel")}
            <Span unstyled className="text-(--color-stamp-gold-text)" aria-hidden="true">
              *
            </Span>
          </Label>
        </div>

        <div className="relative space-y-2">
          <div className="relative">
            <div className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-(--color-stamp-taupe)">
              <Lock className="h-5 w-5" />
            </div>

            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("passwordPlaceholder")}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              className="pr-14 pl-14"
              {...register("password")}
            />

            <div className="absolute right-5 top-1/2 -translate-y-1/2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={
                  showPassword ? t("hidePassword") : t("showPassword")
                }
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

          <InlinePasswordReset className="w-full" />

          {errors.password?.message && (
            <Paragraph
              id="password-error"
              variant="xs"
              role="alert"
              className="text-sm font-medium text-(--color-stamp-error)"
            >
              {ve(errors.password.message)}
            </Paragraph>
          )}
        </div>
      </div>
    </>
  );
}
