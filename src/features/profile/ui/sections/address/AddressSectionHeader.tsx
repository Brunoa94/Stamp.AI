import { MapPin } from "lucide-react";
import { ProfileSectionHeader } from "../../components/ProfileSectionHeader";
import { useTranslations } from "next-intl";

interface AddressSectionHeaderProps {
  hasAddress: boolean;
  isEditing: boolean;
  onEdit: () => void;
}

export function AddressSectionHeader({
  hasAddress,
  isEditing,
  onEdit,
}: AddressSectionHeaderProps) {
  const t = useTranslations("profile.addressSectionHeader");

  return (
    <ProfileSectionHeader
      icon={MapPin}
      title={t("title")}
      subtitle={
        hasAddress
          ? t("subtitleHasAddress")
          : t("subtitleNoAddress")
      }
      buttonText={hasAddress ? t("edit") : t("addAddress")}
      isEditing={isEditing}
      onEdit={onEdit}
    />
  );
}
