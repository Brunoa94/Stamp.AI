import clsx from "clsx";
import { getProgressBarWidth } from "@/utils/formUtils";

interface ProgressBarProps {
  wordCount: number;
  isOverLimit: boolean;
  limit?: number;
}

export default function ProgressBar({
  wordCount,
  isOverLimit,
  limit = 150,
}: ProgressBarProps) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        className={clsx("h-full transition-all duration-500 ease-out", {
          "bg-linear-to-r from-red-400 to-red-500 animate-pulse": isOverLimit,
          "bg-linear-to-r from-yellow-400 to-orange-500":
            !isOverLimit && wordCount > 100,
          "bg-linear-to-r from-slate-400 via-gray-500 to-slate-600":
            !isOverLimit && wordCount <= 100,
        })}
        style={{ width: `${getProgressBarWidth(wordCount, limit)}%` }}
      />
    </div>
  );
}
