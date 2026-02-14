import clsx from "clsx";
import { getColorClass } from "@/helpers/colors/colorMapping";

interface AvailableColorsProps {
  colors?: string[];
  isLoading: boolean;
}

export function AvailableColors({ colors, isLoading }: AvailableColorsProps) {
  return (
    <div>
      <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-gray-100">
        Available Colors
      </h3>
      {isLoading ? (
        <div className="flex gap-2 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded"
            ></div>
          ))}
        </div>
      ) : colors && colors.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {colors.map((color, index) => {
            const colorClass = getColorClass(color);
            return (
              <span
                key={index}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium border-2 border-gray-300 dark:border-gray-600 capitalize flex items-center gap-2"
              >
                {colorClass && (
                  <span
                    className={clsx(
                      "w-4 h-4 rounded-full border-2 border-gray-300 inline-block",
                      colorClass,
                    )}
                  />
                )}
                {color}
              </span>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No color information available
        </p>
      )}
    </div>
  );
}
