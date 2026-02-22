import clsx from "clsx";

type ColorVariant = "green" | "slate" | "gray" | "neutral";

interface StepHeaderProps {
  stepNumber?: number;
  title: string;
  description?: string;
  variant?: ColorVariant;
  emoji?: string;
}

const variantStyles = {
  green: {
    badge: "bg-linear-to-r from-green-500 to-emerald-500",
    text: "bg-linear-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400",
  },
  slate: {
    badge: "bg-linear-to-r from-slate-500 to-gray-600",
    text: "bg-linear-to-r from-slate-600 to-gray-700 dark:from-slate-400 dark:to-gray-400",
  },
  gray: {
    badge: "bg-linear-to-r from-gray-500 to-slate-600",
    text: "bg-linear-to-r from-gray-600 to-slate-700 dark:from-gray-400 dark:to-slate-400",
  },
  neutral: {
    badge: "bg-linear-to-r from-slate-500 to-gray-600",
    text: "bg-linear-to-r from-slate-600 to-gray-700 dark:from-slate-400 dark:to-gray-400",
  },
};

export function StepHeader({
  stepNumber,
  title,
  description,
  variant = "slate",
  emoji,
}: StepHeaderProps) {
  const styles = variantStyles[variant];

  return (
    <div className="text-center bg-transparent">
      <div className="flex items-center justify-center mb-4">
        {stepNumber && (
          <div
            className={clsx(
              "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-4 animate-[bounceIn_0.8s_ease-out] shadow-lg",
              styles.badge,
            )}
          >
            {stepNumber}
          </div>
        )}
        <div className="flex flex-col items-start">
          <h3
            className={clsx(
              "text-3xl font-bold bg-clip-text text-transparent",
              styles.text,
            )}
          >
            {emoji && `${emoji} `}
            {title}
          </h3>
          {description && (
            <p className="text-gray-600 dark:text-gray-300 text-left mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
