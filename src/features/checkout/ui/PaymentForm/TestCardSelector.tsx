interface TestCardOption {
  value: string;
  label: string;
}

interface TestCardGroup {
  label: string;
  options: TestCardOption[];
}

const TEST_CARD_GROUPS: TestCardGroup[] = [
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

interface TestCardSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * TestCardSelector - Dropdown for selecting test card payment methods
 * Used in test mode to simulate different payment scenarios
 */
export function TestCardSelector({ value, onChange }: TestCardSelectorProps) {
  return (
    <div className="space-y-3">
      <label
        htmlFor="test-card-select"
        className="text-xs font-bold uppercase tracking-widest text-slate-600"
      >
        Test Card Type
      </label>
      <select
        id="test-card-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#7C3AED] focus:ring-4 focus:ring-[#7C3AED]/20 transition-all duration-300 bg-white/50 backdrop-blur-sm text-sm font-medium text-slate-700"
      >
        {TEST_CARD_GROUPS.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
