import { mapFeatureToDescription } from "@/utils/htmlUtils";

interface FeaturesProps {
  features: string[];
}

export function Features({ features }: FeaturesProps) {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-gray-100">
        Print Areas
      </h3>
      <div className="flex flex-wrap gap-2">
        {features.map((feature, index) => (
          <span
            key={index}
            className="px-3 py-1.5 bg-linear-to-r from-purple-200 to-pink-200 dark:from-purple-700 dark:to-pink-700 text-purple-800 dark:text-purple-100 rounded-lg text-sm font-medium border border-purple-300 dark:border-purple-600"
          >
            {mapFeatureToDescription(feature)}
          </span>
        ))}
      </div>
    </div>
  );
}
