import type { ShippingAddressT } from "@/schemas/checkout";

/**
 * Test billing data for auto-filling checkout form during development
 * This data is used to speed up testing by pre-filling all required fields
 */
export const TEST_BILLING_DATA: ShippingAddressT = {
  first_name: "Jan",
  last_name: "de Vries",
  email: "jan.devries@example.nl",
  phone: "+31 20 123 4567",
  country: "NL",
  region: "Noord-Holland",
  address1: "Kalverstraat 92",
  address2: "3e verdieping",
  city: "Amsterdam",
  zip: "1012 PH",
};
