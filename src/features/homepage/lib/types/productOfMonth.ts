/** Names the `home.productOfMonth.customized.<altKey>` alt text message */
type ProductOfMonthShotAltKeyT = "logo" | "family" | "brand" | "botanical";

/**
 * A photo of the product of the month printed with a customer design, shown
 * after the blank product photo in the spotlight's crossfade.
 */
export type ProductOfMonthShotT = {
  src: string;
  altKey: ProductOfMonthShotAltKeyT;
};
