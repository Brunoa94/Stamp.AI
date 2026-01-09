import clsx from "clsx";

interface IStepIndicatorProps {
  stepNumber: number | string;
  title: string;
  isCompleted?: boolean;
  isActive?: boolean;
  isDisabled?: boolean;
  className?: string;
  titleClassName?: string;
}

const StepIndicator = ({
  stepNumber,
  title,
  isCompleted = false,
  isActive = false,
  isDisabled = false,
  className,
  titleClassName,
}: IStepIndicatorProps) => {
  const stepStyles = {
    "bg-linear-to-r from-green-500 to-emerald-500 scale-110 animate-pulse":
      isCompleted,
    "bg-linear-to-r from-blue-500 to-purple-500 scale-110":
      isActive && !isCompleted,
    "bg-linear-to-r from-gray-400 to-gray-500 scale-100": isDisabled,
    "bg-linear-to-r from-purple-500 to-pink-500":
      !isCompleted && !isActive && !isDisabled,
  };

  return (
    <div className={clsx("flex items-center mb-6", className)}>
      <div
        className={clsx(
          "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-4 transition-all duration-700 ease-out animate-[bounceIn_0.6s_ease-out_0.2s_both] group-hover:scale-125 group-hover:rotate-12",
          stepStyles
        )}
      >
        {isCompleted ? "✓" : stepNumber}
      </div>
      <h2
        className={clsx(
          "text-xl font-semibold transition-all duration-700 ease-out group-hover:scale-105 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent",
          {
            "opacity-50 transform translate-y-2": isDisabled,
            "opacity-100 transform translate-y-0": !isDisabled,
          },
          titleClassName
        )}
      >
        {title}
      </h2>
    </div>
  );
};

export default StepIndicator;
