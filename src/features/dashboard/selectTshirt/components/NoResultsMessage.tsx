import { Button } from "@/features/ui/button";
import { componentThemes } from "@/theme/components";

interface Props {
  onClearFilters: () => void;
}

export default function NoResultsMessage({ onClearFilters }: Props) {
  return (
    <div className="text-center py-12">
      <div className="bg-linear-to-br from-gray-50 via-gray-100/40 to-gray-50 dark:from-gray-800 dark:via-gray-700/30 dark:to-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          No t-shirt types match your current filters
        </p>
        <Button
          onClick={onClearFilters}
          className={componentThemes.button.primary}
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
}
