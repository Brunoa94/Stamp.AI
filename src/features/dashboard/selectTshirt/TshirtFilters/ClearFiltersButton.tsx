import { Button } from "@/features/ui/button";

interface Props {
  onClear: () => void;
  showButton: boolean;
}

export default function ClearFiltersButton({ onClear, showButton }: Props) {
  if (!showButton) return null;

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <Button
        onClick={onClear}
        variant="ghost"
        size="sm"
        className="text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
      >
        Clear all filters
      </Button>
    </div>
  );
}
