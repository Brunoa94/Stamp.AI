/**
 * Printify Order Types
 * Based on Printify API Official Documentation
 *
 * API Reference: https://developers.printify.com/
 */

/**
 * Line Item for Printify Order
 *
 * IMPORTANT: Three mutually exclusive configurations:
 *
 * 1. Existing Product:
 *    - Use: product_id + variant_id
 *    - Do NOT include: blueprint_id, print_provider_id, print_areas
 *
 * 2. On-the-Fly Product Creation:
 *    - Use: blueprint_id + print_provider_id + variant_id + print_areas
 *    - Do NOT include: product_id
 *
 * 3. SKU-based:
 *    - Use: sku + quantity
 *    - Do NOT include: product_id, blueprint_id, etc.
 */
export interface PrintifyLineItem {
  // Configuration 1: Existing Product
  product_id?: string;

  // Configuration 2: On-the-Fly Product Creation
  // CRITICAL: If print_provider_id is present, blueprint_id MUST be present
  blueprint_id?: number;
  print_provider_id?: number;
  print_areas?: Record<string, any[]>;
  print_details?: Record<string, any>;

  // Configuration 3: SKU-based
  sku?: string;

  // Common fields (all configurations)
  variant_id?: number; // Required for product_id and blueprint_id configurations
  quantity: number;
}

export interface PrintifyShippingAddress {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  region: string;
  address1: string;
  address2?: string;
  city: string;
  zip: string;
}

export interface CreatePrintifyOrderRequest {
  line_items: PrintifyLineItem[];
  shipping_method?: number;
  shipping_address?: PrintifyShippingAddress;
  address_to?: PrintifyShippingAddress;
  is_test?: boolean;
  metadata?: {
    order_id?: string;
    payment_intent_id?: string;
    [key: string]: any;
  };
  use_sample_order?: boolean;
  auto_cancel?: boolean;
}

export interface PrintifyOrderResponse {
  success: boolean;
  order?: {
    id: string;
    status: string;
    external_id: string;
    label: string;
    line_items: any[];
    address_to: PrintifyShippingAddress;
    shipping_method: number;
    [key: string]: any;
  };
  message?: string;
  skipped?: boolean;
  cancel_result?: {
    success: boolean;
    canceled?: boolean;
    status?: string;
    error?: string;
  };
}

/**
 * Validate a Printify line item according to API requirements
 * Returns cleaned line item or throws error
 */
export function validatePrintifyLineItem(item: PrintifyLineItem, index: number): PrintifyLineItem {
  // Validation Rule 1: Must have a primary identifier
  const hasProductId = !!item.product_id;
  const hasBlueprintId = !!item.blueprint_id;
  const hasSku = !!item.sku;

  if (!hasProductId && !hasBlueprintId && !hasSku) {
    throw new Error(
      `Line item ${index}: must have either product_id, blueprint_id, or sku`
    );
  }

  // Validation Rule 2: print_provider_id requires blueprint_id
  if (item.print_provider_id && !item.blueprint_id) {
    throw new Error(
      `Line item ${index}: print_provider_id requires blueprint_id to be present`
    );
  }

  // Validation Rule 3: Cannot mix product_id with blueprint fields
  if (item.product_id && (item.blueprint_id || item.print_provider_id || item.print_areas)) {
    console.warn(
      `Line item ${index}: Removing blueprint fields (blueprint_id, print_provider_id, print_areas) because product_id is present`
    );
    // Clean the item - keep only product_id fields
    return {
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
    };
  }

  // Validation Rule 4: blueprint_id configuration needs variant_id
  if (item.blueprint_id && !item.variant_id) {
    throw new Error(
      `Line item ${index}: blueprint_id configuration requires variant_id`
    );
  }

  return item;
}
