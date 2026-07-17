import { ShippingAddressT } from "@/schemas/checkout";
import { getCountrySelectOptions } from "./countries";

export interface FieldConfig {
  /**
   * Field id. Also the i18n key for the label: rendered via
   * `checkout.addressForm.fields.<id>` at the form site.
   */
  id: keyof ShippingAddressT;
  type?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  gridColumn?: "full" | "half";
}

export interface FieldRow {
  fields: FieldConfig[];
}

/**
 * Shipping form field configuration
 * Organized by rows for flexible grid layouts. Labels are translated at the
 * render site (see FieldConfig.id).
 */
export const shippingFormConfig: FieldRow[] = [
  // Row 1: Name fields
  {
    fields: [
      { id: "first_name", type: "text", required: true, gridColumn: "half" },
      { id: "last_name", type: "text", gridColumn: "half" },
    ],
  },
  // Row 2: Email
  {
    fields: [{ id: "email", type: "email", required: true, gridColumn: "full" }],
  },
  // Row 3: Phone
  {
    fields: [{ id: "phone", type: "tel", gridColumn: "full" }],
  },
  // Row 4: Address Line 1
  {
    fields: [{ id: "address1", type: "text", required: true, gridColumn: "full" }],
  },
  // Row 5: Address Line 2
  {
    fields: [{ id: "address2", type: "text", gridColumn: "full" }],
  },
  // Row 6: City and Region
  {
    fields: [
      { id: "city", type: "text", required: true, gridColumn: "half" },
      { id: "region", type: "text", gridColumn: "half" },
    ],
  },
  // Row 7: ZIP and Country
  {
    fields: [
      { id: "zip", type: "text", required: true, gridColumn: "half" },
      { id: "country", gridColumn: "half", options: getCountrySelectOptions() },
    ],
  },
];
