import type { ShippingAddressT } from "@/schemas/checkout";

/**
 * Test billing data for auto-filling checkout form during development
 * This data is used to speed up testing by pre-filling all required fields
 */
export const TEST_BILLING_DATA: ShippingAddressT = {
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@example.com",
  phone: "+1 555-0123",
  country: "US",
  region: "CA",
  address1: "123 Main Street",
  address2: "Apt 4B",
  city: "San Francisco",
  zip: "94102",
};
