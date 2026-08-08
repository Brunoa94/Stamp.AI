"use client";

import { Button } from "@/features/ui/button";
import { profileInputStyles } from "@/features/ui/form-field";
import { Input } from "@/features/ui/input";
import { Label } from "@/features/ui/label";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { Lock, Save, X } from "lucide-react";
import { usePasswordReset } from "@/features/profile/lib/hooks/usePasswordReset";
import { useTranslations } from "next-intl";
import { ProfileCard } from "../components/ProfileCard";

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
    <ProfileCard
      label={t("label")}
      icon={<Lock className="w-5 h-5" />}
      title={t("title")}
      subtitle={t("subtitle")}
      editLabel={t("changePassword")}
      onEdit={handleStartEditing}
      showEditButton={!isEditing}
    >
      {/* Content */}
      {!isEditing ? (
        <Paragraph variant="sm" className="text-(--color-stamp-taupe) italic">
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
                <Span variant="label" className="text-(--color-stamp-taupe)">
                  {t(`${key}Label`)}
                </Span>
              </Label>
              <Input
                type="password"
                id={id}
                value={fieldValues[key]}
                onChange={(e) => fieldSetters[key](e.target.value)}
                placeholder={t(`${key}Placeholder`)}
                className={profileInputStyles.password}
                autoComplete="new-password"
              />
              <Paragraph variant="xs" className="text-(--color-stamp-taupe) italic">
                {t(`${key}Hint`)}
              </Paragraph>
            </div>
          ))}

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-8 mt-8 border-t border-(--color-stamp-divider)">
            <Button
              type="submit"
              disabled={!canSubmit || isLoading}
              variant="primary-compact"
              className="w-full sm:w-auto group"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? t("updating") : t("updatePassword")}
            </Button>
            <Button
              type="button"
              onClick={handleCancel}
              variant="secondary-compact"
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              <X className="w-4 h-4 mr-2" />
              {t("cancel")}
            </Button>
          </div>
        </form>
      )}
    </ProfileCard>
  );
}
