/**
 * Test-card scenarios shown in the checkout test-mode selector. Mirrors the
 * scenarios supported by the shared usePaymentForm test flow.
 */

export type TestCardOptionType = {
  value: string;
  label: string;
};

export type TestCardGroupType = {
  label: string;
  options: TestCardOptionType[];
};

export const TEST_CARD_GROUPS: TestCardGroupType[] = [
  {
    label: "Successful Payments",
    options: [
      { value: "visa", label: "Visa (pm_card_visa)" },
      { value: "visa_debit", label: "Visa Debit (pm_card_visa_debit)" },
      { value: "mastercard", label: "Mastercard (pm_card_mastercard)" },
      { value: "amex", label: "American Express (pm_card_amex)" },
      { value: "discover", label: "Discover (pm_card_discover)" },
    ],
  },
  {
    label: "Declined Payments",
    options: [
      { value: "declined", label: "Generic Decline" },
      { value: "insufficient_funds", label: "Insufficient Funds" },
      { value: "expired", label: "Expired Card" },
      { value: "processing_error", label: "Processing Error" },
    ],
  },
  {
    label: "3D Secure",
    options: [{ value: "threeDSecure", label: "3D Secure Required" }],
  },
];
