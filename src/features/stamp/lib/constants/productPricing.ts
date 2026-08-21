/**
 * Product Pricing Constants
 *
 * Fallback price charged for products whose variants have no synced
 * price data (min_price_cents = 0 and no admin selling-price
 * override). Shared by the stamp flow's product selection and the
 * /catalog page so both surfaces show the price actually charged.
 */

export const FALLBACK_PRODUCT_PRICE_CENTS = 2500;
