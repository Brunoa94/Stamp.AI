import { Button } from "@/features/ui/button";
import { Input } from "@/features/ui/input";
import { Label } from "@/features/ui/label";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
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
            <Heading
              as="h2"
              variant="cardCompact"
              className="text-xl text-ink mb-1"
            >
              {t("title")}
            </Heading>
            <Paragraph variant="sm" className="text-slate-500 text-sm">
              {t("subtitle")}
            </Paragraph>
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
        <Paragraph variant="sm" className="text-sm text-slate-500 italic">
          {t("hiddenNote")}
        </Paragraph>
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
              <Label htmlFor={id}>
                <Span variant="label" className="text-slate-400">
                  {t(`${key}Label`)}
                </Span>
              </Label>
              <Input
                type="password"
                id={id}
                value={fieldValues[key]}
                onChange={(e) => fieldSetters[key](e.target.value)}
                placeholder={t(`${key}Placeholder`)}
                className="w-full bg-white border border-ink/10 p-4 font-heading placeholder:opacity-10 focus:border-brandCyan focus:ring-4 focus:ring-brandCyan/10 outline-none transition-all"
                autoComplete="new-password"
              />
              <Paragraph variant="xs" className="text-slate-400 italic">
                {t(`${key}Hint`)}
              </Paragraph>
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
