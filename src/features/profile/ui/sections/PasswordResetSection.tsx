/** TO REFACTOR: There are components here with styling applied directly and not through the variants. Refactor them to use variants and components from the design system*/
"use client";

import { Button } from "@/features/ui/button";
import { Input } from "@/features/ui/input";
import { Label } from "@/features/ui/label";
import { Lock, Save, X } from "lucide-react";
import { usePasswordReset } from "@/features/profile/lib/hooks/usePasswordReset";
import { useTranslations } from "next-intl";

// Static field configuration outside component for performance
const passwordFields = [
  {
    id: "new_password",
    key: "newPassword" as const,
  },
  {
    id: "confirm_password",
    key: "confirmPassword" as const,
  },
] as const;

export function PasswordResetSection() {
  const t = useTranslations("profile.passwordReset");
  const {
    isEditing,
    newPassword,
    confirmPassword,
    isLoading,
    canSubmit,
    handleSave,
    handleCancel,
    handleStartEditing,
    setNewPassword,
    setConfirmPassword,
  } = usePasswordReset();

  const fieldSetters = {
    newPassword: setNewPassword,
    confirmPassword: setConfirmPassword,
  } as const;

  const fieldValues = {
    newPassword,
    confirmPassword,
  } as const;

  return (
    <section className="bg-white border border-ink/10 p-8 lg:p-12 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
      {/* Section Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex gap-5">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-(family-name:--font-outfit) uppercase tracking-tight text-ink leading-tight mb-1">
              {t("title")}
            </h2>
            <p className="text-slate-500 text-sm">{t("subtitle")}</p>
          </div>
        </div>
        {!isEditing && (
          <Button
            onClick={handleStartEditing}
            variant="brutalist-ghost"
            className="text-[10px]"
          >
            {t("changePassword")}
          </Button>
        )}
      </div>

      {/* Content */}
      {!isEditing ? (
        <p className="text-sm text-slate-500 italic">{t("hiddenNote")}</p>
      ) : (
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          {passwordFields.map(({ id, key }) => (
            <div key={id} className="space-y-2">
              <Label
                htmlFor={id}
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400"
              >
                {t(`${key}Label`)}
              </Label>
              <Input
                type="password"
                id={id}
                value={fieldValues[key]}
                onChange={(e) => fieldSetters[key](e.target.value)}
                placeholder={t(`${key}Placeholder`)}
                className="w-full bg-white border border-ink/10 p-4 font-(family-name:--font-outfit) placeholder:opacity-10 focus:border-brandCyan focus:ring-4 focus:ring-brandCyan/10 outline-none transition-all"
                autoComplete="new-password"
              />
              <p className="text-[11px] text-slate-400 font-medium italic">
                {t(`${key}Hint`)}
              </p>
            </div>
          ))}

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-8 mt-8 border-t border-slate-200/50">
            <Button
              type="submit"
              disabled={!canSubmit || isLoading}
              variant="brutalist-primary"
              className="w-full sm:w-auto group"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? t("updating") : t("updatePassword")}
            </Button>
            <Button
              type="button"
              onClick={handleCancel}
              variant="brutalist-ghost"
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              <X className="w-4 h-4 mr-2" />
              {t("cancel")}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
