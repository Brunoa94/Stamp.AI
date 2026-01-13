import { TshirtType } from "../useTshirtSelection";
import { cleanAndTruncate, mapFeatureToDescription } from "@/utils/htmlUtils";

interface Props {
  selectedTshirt: TshirtType;
}

export default function TshirtSelectionSummary({ selectedTshirt }: Props) {
  const cleanDescription = cleanAndTruncate(selectedTshirt.description, 200);

  return (
    <div className="bg-linear-to-br from-green-50/50 via-green-100/40 to-emerald-50/50 dark:from-gray-800/80 dark:via-green-800/30 dark:to-emerald-800/30 backdrop-blur-sm border border-green-100 dark:border-green-800/30 rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-linear-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-2xl">
          ✓
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg bg-linear-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
            T-shirt Selected
          </h3>
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            {selectedTshirt.name} - ${selectedTshirt.price.toFixed(2)}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
            {cleanDescription}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedTshirt.features.map((feature, index) => (
              <span
                key={index}
                className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded"
              >
                {mapFeatureToDescription(feature)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
