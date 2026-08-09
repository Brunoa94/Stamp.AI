"use client";

import { MapPin } from "lucide-react";
import { Paragraph } from "@/features/ui/paragraph";
import { useAddressForm } from "@/features/profile/lib/hooks/useAddressForm";
import { AddressFormFields } from "./address/AddressFormFields";
import { AddressFormActions } from "./address/AddressFormActions";
import { AddressDisplay } from "./address/AddressDisplay";
import { useTranslations } from "next-intl";
import { ProfileCard } from "../components/ProfileCard";

export function AddressSection() {
  const t = useTranslations("profile.address");
  const {
    form,
    isEditing,
    hasAddress,
    savedAddress,
    isSaving,
    handleSave,
    handleCancel,
    handleEdit,
  } = useAddressForm();

  const onSubmit = form.handleSubmit(handleSave);

  return (
    <ProfileCard
      label={t("label")}
      icon={<MapPin className="w-5 h-5" />}
      title={t("title")}
      subtitle={hasAddress ? t("subtitleHasAddress") : t("subtitleNoAddress")}
      editLabel={hasAddress ? t("editAddress") : t("addAddress")}
      onEdit={handleEdit}
      showEditButton={!isEditing}
    >
      {/* Content */}
      {isEditing ? (
        <form onSubmit={onSubmit} className="space-y-6">
          <AddressFormFields form={form} />
          <AddressFormActions
            onSave={onSubmit}
            onCancel={handleCancel}
            isSaving={isSaving}
          />
        </form>
      ) : hasAddress && savedAddress ? (
        <AddressDisplay address={savedAddress} />
      ) : (
        <Paragraph variant="sm" className="text-(--color-stamp-taupe) italic">
          {t("emptyState")}
        </Paragraph>
      )}
    </ProfileCard>
  );
}
