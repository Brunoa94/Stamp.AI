import { MapPin } from "lucide-react";
import { ProfileSectionHeader } from "../../components/ProfileSectionHeader";

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
  return (
    <ProfileSectionHeader
      icon={MapPin}
      title="Shipping Address"
      subtitle={
        hasAddress
          ? "Manage your default shipping address"
          : "Add a shipping address for faster checkout"
      }
      buttonText={hasAddress ? "Edit" : "Add Address"}
      isEditing={isEditing}
      onEdit={onEdit}
    />
  );
}
