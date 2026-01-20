import clsx from "clsx";

type ColorVariant = "green" | "purple" | "blue" | "pink";

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
  purple: {
    badge: "bg-linear-to-r from-purple-500 to-pink-500",
    text: "bg-linear-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400",
  },
  blue: {
    badge: "bg-linear-to-r from-blue-500 to-purple-500",
    text: "bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400",
  },
  pink: {
    badge: "bg-linear-to-r from-pink-500 to-purple-500",
    text: "bg-linear-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400",
  },
};

export function StepHeader({
  stepNumber,
  title,
  description,
  variant = "purple",
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
              styles.badge
            )}
          >
            {stepNumber}
          </div>
        )}
        <div className="flex flex-col items-start">
          <h3
            className={clsx(
              "text-3xl font-bold bg-clip-text text-transparent",
              styles.text
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
