interface PercentageRangeSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  leftLabel?: string;
  rightLabel?: string;
  className?: string;
}

export function PercentageRangeSlider({
  value,
  onChange,
  disabled = false,
  min = 0,
  max = 100,
  leftLabel = "Less",
  rightLabel = "More",
  className,
}: PercentageRangeSliderProps) {
  return (
    <div className={className}>
      <div className="flex flex-col gap-2">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full accent-[#7B5CF5] disabled:cursor-not-allowed"
        />

        <div className="flex justify-between text-[10px] text-[#B8B7CC]">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      </div>
    </div>
  );
}
