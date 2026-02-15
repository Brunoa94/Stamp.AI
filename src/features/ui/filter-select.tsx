import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterSelectProps<T extends string = string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: FilterOption[];
  placeholder?: string;
  className?: string;
}

export function FilterSelect<T extends string = string>({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className = "",
}: FilterSelectProps<T>) {
  return (
    <div className={className}>
      <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{placeholder}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
