import type { ShippingAddressI } from "../../../../../../supabase/types";
import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";

interface AddressDisplayProps {
  address: ShippingAddressI;
}

export function AddressDisplay({ address }: AddressDisplayProps) {
  const t = useTranslations("profile.addressDisplay");

  return (
    <div className="space-y-3 p-6 border-2 border-(--color-stamp-divider) bg-(--color-stamp-cream)">
      <Span className="block text-sm font-bold uppercase tracking-wider text-(--color-stamp-chocolate)">
        {address.first_name} {address.last_name}
      </Span>
      <div className="space-y-1">
        <Span className="block text-sm text-(--color-stamp-taupe)">
          {address.address1}
        </Span>
        {address.address2 && (
          <Span className="block text-sm text-(--color-stamp-taupe)">
            {address.address2}
          </Span>
        )}
        <Span className="block text-sm text-(--color-stamp-taupe)">
          {address.city}, {address.region} {address.zip}
        </Span>
        <Span className="block text-sm text-(--color-stamp-taupe)">
          {address.country}
        </Span>
        {address.phone && (
          <Span className="block text-sm text-(--color-stamp-taupe)">
            {t("phone", { phone: address.phone })}
          </Span>
        )}
      </div>
    </div>
  );
}
