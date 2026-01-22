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

  // Checkout handlers state
  shippingAddress: ShippingAddressT | null;
  paymentStatus: "idle" | "success" | "error";
  message: string;
  testMode: boolean;
  isProcessingPayment: boolean;
  triggerPayment: boolean;

  // State setters
  setTestMode: (value: boolean) => void;

  // Event handlers
  handleShippingSubmit: (data: ShippingAddressT) => void;
  handlePaymentSuccess: (paymentIntent: any) => void;
  handlePaymentError: (error: string) => void;
  handleCompleteOrder: () => void;
  handlePaymentSubmitComplete: () => void;
  handleCreateAnother: () => void;
  handleTryAgain: () => void;

  // Computed values
  subtotal: number;
  shippingCost: number;
  discount: number;
  orderAmount: number;
  lineItems: Array<{
    product_id: string;
    variant_id: number;
    quantity: number;
    print_areas: any[];
    print_provider_id: number;
  }>;
}
