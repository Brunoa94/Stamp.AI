import { ShippingAddressT } from "@/schemas/checkout";

export interface FieldConfig {
  id: keyof ShippingAddressT;
  label: string;
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
 * Organized by rows for flexible grid layouts
 */
export const shippingFormConfig: FieldRow[] = [
  // Row 1: Name fields
  {
    fields: [
      {
        id: "first_name",
        label: "First Name",
        type: "text",
        required: true,
        gridColumn: "half",
      },
      {
        id: "last_name",
        label: "Last Name",
        type: "text",
        gridColumn: "half",
      },
    ],
  },
  // Row 2: Email
  {
    fields: [
      {
        id: "email",
        label: "Email",
        type: "email",
        required: true,
        gridColumn: "full",
      },
    ],
  },
  // Row 3: Phone
  {
    fields: [
      {
        id: "phone",
        label: "Phone",
        type: "tel",
        gridColumn: "full",
      },
    ],
  },
  // Row 4: Address Line 1
  {
    fields: [
      {
        id: "address1",
        label: "Address Line 1",
        type: "text",
        required: true,
        gridColumn: "full",
      },
    ],
  },
  // Row 5: Address Line 2
  {
    fields: [
      {
        id: "address2",
        label: "Address Line 2",
        type: "text",
        gridColumn: "full",
      },
    ],
  },
  // Row 6: City and Region
  {
    fields: [
      {
        id: "city",
        label: "City",
        type: "text",
        required: true,
        gridColumn: "half",
      },
      {
        id: "region",
        label: "State/Region",
        type: "text",
        gridColumn: "half",
      },
    ],
  },
  // Row 7: ZIP and Country
  {
    fields: [
      {
        id: "zip",
        label: "ZIP/Postal Code",
        type: "text",
        required: true,
        gridColumn: "half",
      },
      {
        id: "country",
        label: "Country",
        gridColumn: "half",
        options: [
          { value: "US", label: "United States" },
          { value: "CA", label: "Canada" },
          { value: "GB", label: "United Kingdom" },
          { value: "AU", label: "Australia" },
          { value: "DE", label: "Germany" },
          { value: "FR", label: "France" },
        ],
      },
    ],
  },
];
