import { Button } from "@/features/ui/button";

interface Props {
  onClearFilters: () => void;
}

const ClearAllFilters = ({ onClearFilters }: Props) => {
  return (
    <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-700">
      <Button
        onClick={onClearFilters}
        variant="ghost"
        size="sm"
        className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
      >
        Clear all filters
      </Button>
    </div>
  );
};

export default ClearAllFilters;
