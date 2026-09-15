import type { PaymentProviderT } from "../../supabase/functions/_shared/paymentReference";
import type { ShippingAddressT } from "@/schemas/checkout";

/** Cart item identity/display fields sent to `finalize-order` (no prices). */
export type FinalizeOrderCartItemT = {
  id: string;
  product_id: string | null;
  product_name: string | null;
  variant_id: string | null;
  variant_name: string | null;
  quantity: number;
  custom_image_url: string | null;
  printify_blueprint_id: number | null;
  is_selected: boolean;
};

export type FinalizeOrderRequestT = {
  provider: PaymentProviderT;
  payment_id: string;
  cart_items: FinalizeOrderCartItemT[];
  shipping_address: ShippingAddressT | null;
  billing_address: ShippingAddressT | null;
};

export type FinalizeOrderResponseT = {
  success: boolean;
  order_id: string;
  order_number: string | null;
  created: boolean;
  total_cents: number | null;
};
