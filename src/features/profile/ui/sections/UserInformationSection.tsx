"use client";

import { Button } from "@/features/ui/button";
import { profileInputStyles } from "@/features/ui/form-field";
import { Input } from "@/features/ui/input";
import { Label } from "@/features/ui/label";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { User, Save, X } from "lucide-react";
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
      icon={<User className="w-5 h-5" />}
      title={t("title")}
      subtitle={t("subtitle")}
      editLabel={t("edit")}
      onEdit={handleStartEditing}
      showEditButton={!isEditing}
    >
      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="first_name">
            <Span variant="label" className="text-(--color-stamp-taupe)">
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
            <Span variant="label" className="text-(--color-stamp-taupe)">
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

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="email">
            <Span variant="label" className="text-(--color-stamp-taupe)">
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
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-8 mt-8 border-t border-(--color-stamp-divider)">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            variant="primary-compact"
            className="w-full sm:w-auto group"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? t("saving") : t("saveChanges")}
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
      )}
    </ProfileCard>
  );
}
