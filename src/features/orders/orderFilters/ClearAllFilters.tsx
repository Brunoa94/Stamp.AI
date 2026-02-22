import { Button } from "@/features/ui/button";

interface Props {
  onClearFilters: () => void;
}

const ClearAllFilters = ({ onClearFilters }: Props) => {
  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <Button
        onClick={onClearFilters}
        variant="ghost"
        size="sm"
        className="text-slate-700 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300"
      >
        Clear all filters
      </Button>
    </div>
  );
};

export default ClearAllFilters;
