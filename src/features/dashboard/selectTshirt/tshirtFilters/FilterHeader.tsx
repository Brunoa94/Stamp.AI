interface Props {
  filteredCount: number;
  totalTypes: number;
}

export default function FilterHeader({ filteredCount, totalTypes }: Props) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold bg-linear-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
        Filter & Sort
      </h3>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        Showing {filteredCount} of {totalTypes} types
      </span>
    </div>
  );
}
