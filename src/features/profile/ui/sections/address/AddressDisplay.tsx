import type { ShippingAddressI } from "@/types/api";
import { profileTheme } from "@/theme";

interface AddressDisplayProps {
  address: ShippingAddressI;
}

export function AddressDisplay({ address }: AddressDisplayProps) {
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
        <p className="text-sm text-slate-600">Phone: {address.phone}</p>
      )}
    </div>
  );
}
