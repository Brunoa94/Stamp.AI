export interface CreditPackage {
  credits: number;
  price: number;
  popular: boolean;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  { credits: 100, price: 9.99, popular: false },
  { credits: 250, price: 19.99, popular: true },
  { credits: 500, price: 34.99, popular: false },
  { credits: 1000, price: 59.99, popular: false },
];

export const PRICE_PER_CREDIT = 0.10;

export const MIN_CUSTOM_CREDITS = 10;

export const DEFAULT_SELECTED_PACKAGE = 250;
