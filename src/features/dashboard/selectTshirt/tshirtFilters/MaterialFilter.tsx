interface Props {
  value: string;
  onChange: (material: string) => void;
  availableMaterials: string[];
}

export default function MaterialFilter({ value, onChange, availableMaterials }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Material
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
      >
        <option value="all">All Materials</option>
        {availableMaterials.map((material) => (
          <option key={material} value={material}>
            {material}
          </option>
        ))}
      </select>
    </div>
  );
}