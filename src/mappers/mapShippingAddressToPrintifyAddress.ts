import { ShippingAddressT } from "@/schemas/checkout";
import type { PrintifyShippingAddress } from "@/types/printifyOrder";

/**
 * Maps shipping address from checkout form to Printify API format
 * @param shippingAddress - The shipping address from checkout form
 * @returns Printify-compatible shipping address object
 */
export function mapShippingAddressToPrintifyAddress(
  shippingAddress: ShippingAddressT
): PrintifyShippingAddress {
  return {
    first_name: shippingAddress.first_name,
    last_name: shippingAddress.last_name || "",
    email: shippingAddress.email,
    phone: shippingAddress.phone || "",
    country: shippingAddress.country,
    region: shippingAddress.region || "",
    address1: shippingAddress.address1,
    address2: shippingAddress.address2 || "",
    city: shippingAddress.city,
    zip: shippingAddress.zip || "",
  };
}
