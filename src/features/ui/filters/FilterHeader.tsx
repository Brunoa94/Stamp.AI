interface FilterHeaderProps {
  title?: string;
  filteredCount?: number;
  totalCount?: number;
  countLabel?: string;
}

export function FilterHeader({
  title = "Filter & Sort",
  filteredCount,
  totalCount,
  countLabel = "types",
}: FilterHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold bg-linear-to-r from-slate-600 via-gray-600 to-slate-700 dark:from-slate-400 dark:via-gray-400 dark:to-slate-400 bg-clip-text text-transparent">
        {title}
      </h3>
      {filteredCount !== undefined && totalCount !== undefined && (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredCount} of {totalCount} {countLabel}
        </span>
      )}
    </div>
  );
}
