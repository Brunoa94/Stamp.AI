import type { ShippingAddressI } from "@/types/api";

interface AddressDisplayProps {
  address: ShippingAddressI;
}

export function AddressDisplay({ address }: AddressDisplayProps) {
  return (
    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
      <p className="font-medium text-gray-900 dark:text-gray-100">
        {address.first_name} {address.last_name}
      </p>
      <p>{address.address1}</p>
      {address.address2 && <p>{address.address2}</p>}
      <p>
        {address.city}, {address.region} {address.zip}
      </p>
      <p>{address.country}</p>
      {address.phone && <p>Phone: {address.phone}</p>}
    </div>
  );
}
