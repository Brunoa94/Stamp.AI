export type AnalyticsEventNameT =
  // Auth
  | "sign_up"
  | "login"
  | "logout"
  // GA4 enhanced e-commerce
  | "select_item"
  | "add_to_cart"
  | "remove_from_cart"
  | "view_cart"
  | "begin_checkout"
  | "add_payment_info"
  | "purchase"
  // Stamp flow
  | "stamp_image_upload"
  | "stamp_generate_start"
  | "stamp_generate_complete"
  | "stamp_generate_failed"
  | "stamp_create_product"
  // Customization
  | "color_select"
  | "size_select"
  // Navigation
  | "page_view"
  | "step_change";

export type AnalyticsItemT = {
  item_id: string;
  item_name: string;
  price?: number;
  quantity?: number;
  item_variant?: string;
};

export type AnalyticsEventParamsT = {
  [key: string]:
    | string
    | number
    | boolean
    | AnalyticsItemT[]
    | undefined;
};

export type QueuedAnalyticsEventT = {
  name: AnalyticsEventNameT;
  params?: AnalyticsEventParamsT;
};

export type GtagFunctionT = (
  command: "js" | "config" | "event" | "set" | "consent",
  targetOrEventName: string | Date,
  params?: Record<string, unknown>,
) => void;

declare global {
  interface Window {
    gtag?: GtagFunctionT;
    dataLayer?: unknown[];
  }
}
