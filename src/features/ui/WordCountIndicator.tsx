import { AlertCircle } from "lucide-react";
import { clsx } from "clsx";
import ProgressBar from "@/features/ui/progress-bar";
import { getWordCountColor } from "@/utils/formUtils";

interface Props {
  wordCount: number;
  limit: number;
  isOverLimit: boolean;
  colorClass?: string;
  showProgressBar?: boolean;
}

const WordCountIndicator = ({
  wordCount,
  limit,
  isOverLimit,
  colorClass,
  showProgressBar = true,
}: Props) => {
  const computedColorClass = colorClass || getWordCountColor(wordCount, limit);

  return (
    <div className={clsx("space-y-3", { "space-y-0": !showProgressBar })}>
      <div className="flex justify-between items-center">
        <div
          className={clsx(
            "text-sm font-medium flex items-center",
            computedColorClass,
          )}
        >
          <div
            className={clsx("w-2 h-2 rounded-full mr-2", {
              "bg-red-400 animate-pulse": isOverLimit,
              "bg-current": !isOverLimit,
            })}
          />
          {wordCount}/{limit} words
        </div>

        {isOverLimit && (
          <div className="flex items-center text-red-500 text-xs font-medium animate-[shake_0.5s_ease-in-out]">
            <AlertCircle className="w-3 h-3 mr-1" />
            Keep it under {limit} words
          </div>
        )}
      </div>

      {showProgressBar && (
        <ProgressBar
          wordCount={wordCount}
          isOverLimit={isOverLimit}
          limit={limit}
        />
      )}
    </div>
  );
};

export default WordCountIndicator;
