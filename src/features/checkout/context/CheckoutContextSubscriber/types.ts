import { ShippingAddressT, ProductCustomizationT } from "@/schemas/checkout";
import { CustomProductT } from "@/types/printify";
import type { Database } from "../../../../../database.types";

export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];

export interface CheckoutSubscriberContextState {
  // Data state
  order: Order | null;
  orderItems: OrderItem[];
  customProduct: CustomProductT | null;
  isLoading: boolean;
  error: Error | null;

  // Customization
  customization: ProductCustomizationT;

  // Checkout flow state
  shippingAddress: ShippingAddressT | null;
  paymentStatus: "idle" | "success" | "error";
  message: string;
  testMode: boolean;
  isProcessingPayment: boolean;
  triggerPayment: boolean;

  // Computed values
  subtotal: number;
  shippingCost: number;
  discount: number;
  orderAmount: number;
  lineItems: Array<{
    product_id: string;
    variant_id: number;
    quantity: number;
    print_areas: Array<{
      position: string;
      image_id: string | undefined;
    }>;
    print_provider_id: number;
  }>;
}
