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
import type { LoginI } from "@/schemas/auth";
import { useValidationMessage } from "@/hooks/useValidationMessage";
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
          <Label htmlFor="password" className="flex items-center">
            <Span variant="default" className="text-(--color-stamp-chocolate)">
              {t("passwordLabel")}
            </Span>
            <Span variant="default" className="text-(--color-stamp-gold) ml-1" aria-hidden="true">
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
              className="h-12 border-2 border-(--color-stamp-divider) bg-(--color-stamp-cream) px-4 text-base font-normal text-(--color-stamp-chocolate) placeholder:text-(--color-stamp-taupe)/50 focus-visible:border-(--color-stamp-gold) focus-visible:ring-2 focus-visible:ring-(--color-stamp-gold)/20 pl-14 pr-14"
              {...register("password")}
            />

            <div className="absolute right-5 top-1/2 -translate-y-1/2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={showPassword ? t("hidePassword") : t("showPassword")}
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
              variant="micro"
              role="alert"
              className="font-bold uppercase tracking-widest text-(--color-stamp-error)"
            >
              {ve(errors.password.message)}
            </Paragraph>
          )}
        </div>
      </div>
    </>
  );
}
