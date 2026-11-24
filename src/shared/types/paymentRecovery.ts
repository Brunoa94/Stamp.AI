import type { PrintifyLineItem } from "@/shared/types/printifyOrder";
import type { ShippingAddressT } from "@/shared/schemas/checkout";
import type { CartWithItems } from "@/shared/types/cart";

/** A payment recorded for recovery whose order was never created. */
export type PaymentRecoveryRecordT = {
  id: string;
  payment_provider: "stripe" | "paypal" | "mollie";
  payment_intent_id: string;
  amount: number;
  currency: string;
  cart_snapshot: CartWithItems;
  shipping_address: ShippingAddressT;
  line_items: PrintifyLineItem[];
  created_at: string;
};
