import { ShippingAddressT } from "@/schemas/checkout";

/**
 * Stripe billing details type
 * Compatible with Stripe's PaymentMethodCreateParams.billing_details
 */
export type StripeBillingDetails = {
  name?: string;
  email?: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
};

/**
 * Maps shipping address to Stripe billing details format
 * @param shippingAddress - The shipping address from checkout form
 * @returns Stripe-compatible billing details object
 */
export function mapShippingAddressToBillingDetails(
  shippingAddress: ShippingAddressT
): StripeBillingDetails {
  return {
    name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
    email: shippingAddress.email,
    phone: shippingAddress.phone,
    address: {
      line1: shippingAddress.address1,
      line2: shippingAddress.address2 || undefined,
      city: shippingAddress.city,
      state: shippingAddress.region,
      postal_code: shippingAddress.zip,
      country: shippingAddress.country,
    },
  };
}
