import type { ShippingAddressI } from "../../../../../../supabase/types";
import { useTranslations } from "next-intl";

interface AddressDisplayProps {
  address: ShippingAddressI;
}

export function AddressDisplay({ address }: AddressDisplayProps) {
  const t = useTranslations("profile.addressDisplay");

  return (
    <div className="space-y-2">
      <p className="font-medium text-slate-900">
        {address.first_name} {address.last_name}
      </p>
      <p className="text-sm text-slate-600">{address.address1}</p>
      {address.address2 && (
        <p className="text-sm text-slate-600">{address.address2}</p>
      )}
      <p className="text-sm text-slate-600">
        {address.city}, {address.region} {address.zip}
      </p>
      <p className="text-sm text-slate-600">{address.country}</p>
      {address.phone && (
        <p className="text-sm text-slate-600">{t("phone", { phone: address.phone })}</p>
      )}
    </div>
  );
}
