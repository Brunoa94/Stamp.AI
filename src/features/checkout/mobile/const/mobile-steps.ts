export const STEPS = [
  { index: 0, stepNumber: "01", title: "Shipping Address" },
  { index: 1, stepNumber: "02", title: "Shipping Method" },
  { index: 2, stepNumber: "03", title: "Billing Info" },
  { index: 3, stepNumber: "04", title: "Payment Method" },
] as const;

export const TOTAL_STEPS = STEPS.length;