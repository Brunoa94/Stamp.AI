import { TabsList, TabsTrigger } from "@/features/ui/tabs";

export type OptionItem<T> = {
  value: T;
  label: string;
};

export interface OptionsTabProps<T> {
  options?: OptionItem<T>[];
  value?: T;
  onValueChange?: (value: T) => void;
  className?: string;
}

export default function OptionsTab<T>({
  options,
  value,
  onValueChange,
  className,
}: OptionsTabProps<T>) {
  const handleValueChange = (newValue: string) => {
    // Find the original value by matching the string representation
    const option = options?.find((opt) => String(opt.value) === newValue);
    if (option && onValueChange) {
      onValueChange(option.value);
    }
  };

  return (
    <TabsList className={className}>
      {options?.map((option) => (
        <TabsTrigger
          key={option.label}
          value={String(option.value)}
          onClick={() => onValueChange?.(option.value)}
        >
          {option.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
