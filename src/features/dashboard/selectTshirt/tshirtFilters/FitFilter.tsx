interface Props {
  value: string;
  onChange: (fit: string) => void;
  availableFits: string[];
}

export default function FitFilter({ value, onChange, availableFits }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Fit
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
      >
        <option value="all">All Fits</option>
        {availableFits.map((fit) => (
          <option key={fit} value={fit}>
            {fit}
          </option>
        ))}
      </select>
    </div>
  );
}