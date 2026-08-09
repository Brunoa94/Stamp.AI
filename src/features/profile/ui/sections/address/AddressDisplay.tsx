import type { ShippingAddressI } from "../../../../../../supabase/types";
import { useTranslations } from "next-intl";
import { Paragraph } from "@/features/ui/paragraph";

interface AddressDisplayProps {
  address: ShippingAddressI;
}

export function AddressDisplay({ address }: AddressDisplayProps) {
  const t = useTranslations("profile.addressDisplay");

  return (
    <div className="space-y-2">
      <Paragraph variant="sm" className="font-medium text-(--color-stamp-chocolate)">
        {address.first_name} {address.last_name}
      </Paragraph>
      <Paragraph variant="sm" className="text-(--color-stamp-taupe)">
        {address.address1}
      </Paragraph>
      {address.address2 && (
        <Paragraph variant="sm" className="text-(--color-stamp-taupe)">
          {address.address2}
        </Paragraph>
      )}
      <Paragraph variant="sm" className="text-(--color-stamp-taupe)">
        {address.city}, {address.region} {address.zip}
      </Paragraph>
      <Paragraph variant="sm" className="text-(--color-stamp-taupe)">
        {address.country}
      </Paragraph>
      {address.phone && (
        <Paragraph variant="sm" className="text-(--color-stamp-taupe)">
          {t("phone", { phone: address.phone })}
        </Paragraph>
      )}
    </div>
  );
}
