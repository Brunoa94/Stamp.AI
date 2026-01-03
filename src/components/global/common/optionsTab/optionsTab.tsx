import { useState, useEffect } from "react";
import FilterTab from "./filterTab";
import AnimatedBackground from "@/theme/animatedBackground";

export type OptionItem<T> = {
  value: T;
  label: string;
};

export interface OptionsTabProps<T> {
  options?: OptionItem<T>[];
  value?: T;
  onValueChange?: (value: T) => void;
}

export default function OptionsTab<T>({
  options,
  value,
  onValueChange,
}: OptionsTabProps<T>) {
  const [activeTabRef, setActiveTabRef] = useState<HTMLButtonElement | null>(
    null
  );

  const handleValueChange = (newValue: T, buttonRef: HTMLButtonElement) => {
    onValueChange?.(newValue);
    setActiveTabRef(buttonRef);
  };

  return (
    <div className="bg-muted text-muted-foreground relative inline-flex h-10 w-fit items-center justify-center rounded-lg p-1">
      <AnimatedBackground
        activeRef={activeTabRef}
        transitionDuration="200ms"
        borderRadius="rounded-md"
      />
      {options?.map((option) => (
        <FilterTab<T>
          key={option.label}
          value={option.value}
          label={option.label}
          handleValueChange={handleValueChange}
          isActive={option.value === value}
        />
      ))}
    </div>
  );
}
