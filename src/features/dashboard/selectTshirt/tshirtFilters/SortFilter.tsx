import { SortOption } from "../types";

interface Props {
  value: SortOption;
  onChange: (sort: SortOption) => void;
}

export default function SortFilter({ value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Sort By
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
      >
        <option value="price">Price (Low to High)</option>
        <option value="name">Name (A to Z)</option>
      </select>
    </div>
  );
}