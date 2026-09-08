/**
 * Test-card scenarios shown in the checkout test-mode selector. Mirrors the
 * scenarios supported by the shared usePaymentForm test flow.
 *
 * Display labels live in the i18n messages (checkout.testCards); only the
 * stable structural values (group id + option value) live here.
 */

type TestCardOptionType = {
  value: string;
};

type TestCardGroupType = {
  id: string;
  options: TestCardOptionType[];
};

export const TEST_CARD_GROUPS: TestCardGroupType[] = [
  {
    id: "successful",
    options: [
      { value: "visa" },
      { value: "visa_debit" },
      { value: "mastercard" },
      { value: "amex" },
      { value: "discover" },
    ],
  },
  {
    id: "declined",
    options: [
      { value: "declined" },
      { value: "insufficient_funds" },
      { value: "expired" },
      { value: "processing_error" },
    ],
  },
  {
    id: "threeDSecure",
    options: [{ value: "threeDSecure" }],
  },
];
