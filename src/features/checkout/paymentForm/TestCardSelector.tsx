import { componentThemes } from "@/theme/components";

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
  className?: string;
}

export function TestCardSelector({
  value,
  onChange,
  className,
}: TestCardSelectorProps) {
  return (
    <div
      className={
        className ||
        "border-2 border-purple-200 rounded-xl p-4 bg-white/50 backdrop-blur-sm"
      }
    >
      <label htmlFor="test-card-select" className={componentThemes.text.label}>
        Select Test Card
      </label>
      <select
        id="test-card-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={componentThemes.input.base}
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
