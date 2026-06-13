/**
 * Type definitions for customization mapping
 */

export type OrderItemDataType = {
  product_id?: string;
  variant_id?: string;
  quantity: number;
  design_config?: any;
  product_name?: string;
  variant_name?: string;
  unit_price: number;
  custom_image_url?: string;
}

export type CustomProductDataType = {
  id?: string;
  title?: string;
  blueprint_id?: number;
  print_provider_id?: number;
  variants?: Array<{
    id: number;
    title?: string;
    price: number;
  }>;
  images?: Array<{
    src?: string;
  }>;
}

export type OrderDataType = {
  product_id?: string;
}
