import { Button } from "@/features/ui/button";
import { cn } from "@/lib/utils";

interface SizeOption {
  name: string;
  available: boolean;
}

interface SizeSelectorProps {
  sizes: SizeOption[];
  selectedSize: string | null;
  onSizeSelect: (size: string) => void;
}

export function SizeSelector({
  sizes,
  selectedSize,
  onSizeSelect,
}: SizeSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Size
      </label>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {sizes.map((size) => (
          <Button
            key={size.name}
            type="button"
            variant="outline"
            onClick={() => size.available && onSizeSelect(size.name)}
            disabled={!size.available}
            className={cn(
              "relative h-auto py-3 font-semibold",
              selectedSize === size.name && size.available && "border-purple-500 bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300 shadow-md",
              selectedSize !== size.name && size.available && "hover:border-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-900/20"
            )}
            aria-pressed={selectedSize === size.name}
          >
            {size.name}
            {selectedSize === size.name && size.available && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full" />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
