import { mapFeatureToDescription } from "@/utils/htmlUtils";

interface Props {
  features: string[];
}

export default function TshirtFeatures({ features }: Props) {
  return (
    <ul className="space-y-1">
      {features.map((feature, index) => (
        <li
          key={index}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
        >
          <span
            className="w-1.5 h-1.5 bg-gray-400 rounded-full"
            aria-hidden="true"
          ></span>
          {mapFeatureToDescription(feature)}
        </li>
      ))}
    </ul>
  );
}
