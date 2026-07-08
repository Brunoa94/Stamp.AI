import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/features/ui/select";

type TestCardOptionType = {
  value: string;
  label: string;
};

type TestCardGroupType = {
  label: string;
  options: TestCardOptionType[];
};

const TEST_CARD_GROUPS: TestCardGroupType[] = [
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

interface PropsI {
  value: string;
  onChange: (value: string) => void;
}

/**
 * TestCardSelector - Dropdown for selecting test card payment methods
 * Used in test mode to simulate different payment scenarios
 */
export function TestCardSelector({ value, onChange }: PropsI) {
  return (
    <div className="space-y-3">
      <label
        htmlFor="test-card-select"
        className="text-xs font-bold uppercase tracking-widest text-slate-600"
      >
        Test Card Type
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="test-card-select" className="w-full">
          <SelectValue placeholder="Select test card type" />
        </SelectTrigger>
        <SelectContent>
          {TEST_CARD_GROUPS.map((group, groupIndex) => (
            <SelectGroup key={group.label}>
              <SelectLabel>{group.label}</SelectLabel>
              {group.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
              {groupIndex < TEST_CARD_GROUPS.length - 1 && <SelectSeparator />}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
