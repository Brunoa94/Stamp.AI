import { useTranslations } from "next-intl";

interface FilterHeaderProps {
  title?: string;
  filteredCount?: number;
  totalCount?: number;
  countLabel?: string;
}

export function FilterHeader({
  title,
  filteredCount,
  totalCount,
  countLabel,
}: FilterHeaderProps) {
  const t = useTranslations("ui.filterHeader");
  const resolvedTitle = title ?? t("title");
  const resolvedCountLabel = countLabel ?? t("countLabel");
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold bg-linear-to-r from-slate-600 via-gray-600 to-slate-700 dark:from-slate-400 dark:via-gray-400 dark:to-slate-400 bg-clip-text text-transparent">
        {resolvedTitle}
      </h3>
      {filteredCount !== undefined && totalCount !== undefined && (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {t("count", {
            filteredCount,
            totalCount,
            countLabel: resolvedCountLabel,
          })}
        </span>
      )}
    </div>
  );
}
