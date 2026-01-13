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
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full pl-4 pr-10 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
      >
        <option value="all">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
