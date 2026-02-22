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
            className="px-3 py-1.5 bg-linear-to-r from-gray-200 to-slate-200 dark:from-slate-700 dark:to-gray-700 text-slate-800 dark:text-slate-100 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600"
          >
            {mapFeatureToDescription(feature)}
          </span>
        ))}
      </div>
    </div>
  );
}
