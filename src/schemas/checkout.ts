import { z } from "zod";
import { COUNTRIES } from "@/constants/countries";

// Valid country codes from our countries list
const validCountryCodes = COUNTRIES.map(c => c.code);

// Zod `message` values are i18n keys under the `validation` namespace,
// translated at the form render site via next-intl (useTranslations).

// Shipping Address Schema
export const ShippingAddressSchema = z.object({
  first_name: z.string().min(1, "firstNameRequired"),
  last_name: z.string().optional(),
  email: z.string().email("emailInvalid"),
  phone: z.string().optional(),
  country: z.string()
    .min(2, "countryRequired")
    .refine((code) => validCountryCodes.includes(code), {
      message: "countryInvalid",
    }),
  region: z.string().optional(),
  address1: z.string().min(1, "addressRequired"),
  address2: z.string().optional(),
  city: z.string().min(1, "cityRequired"),
  zip: z.string().min(1, "zipRequired"),
});

export type ShippingAddressT = z.infer<typeof ShippingAddressSchema>;

// Checkout Form Schema with conditional validation
export const CheckoutFormSchema = z
  .object({
    // Billing address (required)
    billing: ShippingAddressSchema,

    // Shipping address toggle and data
    useShippingAddress: z.boolean(),
    shipping: ShippingAddressSchema.optional(),

    // Payment method
    paymentMethod: z.enum(["stripe", "paypal"] as const),

    // Promo code
    promoCode: z.string().optional(),
  })
  .refine(
    (data) => {
      // If shipping address toggle is enabled, shipping must be provided and valid
      if (data.useShippingAddress) {
        return data.shipping !== undefined;
      }
      return true;
    },
    {
      message: "shippingRequiredWhenEnabled",
      path: ["shipping"],
    }
  );

export type CheckoutFormDataT = z.infer<typeof CheckoutFormSchema>;

