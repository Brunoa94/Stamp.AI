import clsx from "clsx";

interface Step {
  key: string;
  label: string;
}

interface Props {
  steps: Step[];
  currentStep: string;
}

const StepIndicator = ({ steps, currentStep }: Props) => {
  const getCurrentStepIndex = () => {
    return steps.findIndex((s) => s.key === currentStep);
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <nav aria-label="Checkout progress" className="mb-8">
      <ol className="flex items-center justify-center gap-4">
        {steps.map((step, index) => {
          const isActive = currentIndex === index;
          const isCompleted = currentIndex > index;

          return (
            <li key={step.key} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    {
                      "bg-blue-600 text-white": isActive,
                      "bg-green-500 text-white": isCompleted,
                      "bg-gray-200 text-gray-600": !isActive && !isCompleted,
                    }
                  )}
                  aria-current={isActive ? "step" : undefined}
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={clsx("text-sm font-medium", {
                    "text-gray-900": isActive,
                    "text-gray-600": !isActive && !isCompleted,
                    "text-green-600": isCompleted,
                  })}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={clsx("w-12 h-0.5 mx-4 transition-colors", {
                    "bg-green-500": isCompleted,
                    "bg-gray-200": !isCompleted,
                  })}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default StepIndicator;
