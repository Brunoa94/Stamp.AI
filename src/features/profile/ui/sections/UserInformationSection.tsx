"use client";

import { Button } from "@/features/ui/button";
import { profileInputStyles } from "@/features/ui/form-field";
import { Input } from "@/features/ui/input";
import { Label } from "@/features/ui/label";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { useUserInformation } from "@/features/profile/lib/hooks/useUserInformation";
import { useTranslations } from "next-intl";
import { ProfileCard } from "../components/ProfileCard";

export function UserInformationSection() {
  const t = useTranslations("profile.userInformation");
  const {
    isEditing,
    firstName,
    lastName,
    email,
    isLoading,
    handleSave,
    handleCancel,
    handleStartEditing,
    setFirstName,
    setLastName,
  } = useUserInformation();

  return (
    <ProfileCard
      label={t("label")}
      title={t.rich("title", {
        accent: (chunks) => (
          <Span variant="serif" className="text-(--color-stamp-taupe)">
            {chunks}
          </Span>
        ),
      })}
      subtitle={t("subtitle")}
      editLabel={t("edit")}
      onEdit={handleStartEditing}
      showEditButton={!isEditing}
    >
      {/* Form Fields */}
      <div className="space-y-6 md:space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-2">
            <Label htmlFor="first_name">
              <Span
                variant="sm"
                className="text-(--color-stamp-chocolate)"
              >
                {t("firstNameLabel")}
              </Span>
            </Label>
            <Input
              type="text"
              id="first_name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              readOnly={!isEditing}
              className={isEditing ? profileInputStyles.editable : profileInputStyles.readonly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">
              <Span
                variant="sm"
                className="text-(--color-stamp-chocolate)"
              >
                {t("lastNameLabel")}
              </Span>
            </Label>
            <Input
              type="text"
              id="last_name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              readOnly={!isEditing}
              className={isEditing ? profileInputStyles.editable : profileInputStyles.readonly}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            <Span
              variant="sm"
              className="text-(--color-stamp-chocolate)"
            >
              {t("emailLabel")}
            </Span>
          </Label>
          <Input
            type="email"
            id="email"
            value={email}
            readOnly
            className={profileInputStyles.readonly}
          />
          <Paragraph variant="xs" className="text-(--color-stamp-taupe) italic">
            {t("emailNote")}
          </Paragraph>
        </div>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-8 mt-8 border-t border-(--color-stamp-divider)">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="w-full sm:w-auto bg-(--color-stamp-chocolate) text-white hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) transition-all duration-300 px-8 py-4 text-xs font-bold tracking-[0.15em] uppercase disabled:opacity-50"
          >
            {isLoading ? t("saving") : t("saveChanges")}
          </Button>
          <Button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="w-full sm:w-auto border-2 border-(--color-stamp-divider) bg-transparent text-(--color-stamp-chocolate) hover:border-(--color-stamp-chocolate) transition-all duration-300 px-8 py-4 text-xs font-bold tracking-[0.15em] uppercase"
          >
            {t("cancel")}
          </Button>
        </div>
      )}
    </ProfileCard>
  );
}
