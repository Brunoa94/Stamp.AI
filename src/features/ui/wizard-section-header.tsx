import clsx from "clsx";

interface WizardSectionHeaderProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  currentStep?: number;
}

export function WizardSectionHeader({
  stepNumber,
  totalSteps,
  title,
  currentStep = 1,
}: WizardSectionHeaderProps) {
  return (
    <div className="px-12 py-12 relative flex items-center justify-between overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-purple-50/50 via-white to-white pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[10px] font-bold text-purple-600 tracking-[0.2em] uppercase bg-purple-50 px-2 py-1 rounded border border-purple-100">
            Step {stepNumber.toString().padStart(2, "0")}
          </span>
          <div className="h-px w-12 bg-linear-to-r from-purple-400/40 to-transparent" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          {title}
        </h1>
        <div className="mt-3 flex gap-1">
          <div className="h-1 w-12 bg-purple-600 rounded-full" />
          <div className="h-1 w-2 bg-purple-400/40 rounded-full" />
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={clsx(
              "w-2.5 h-2.5 rounded-full transition-all duration-300",
              {
                "bg-purple-600 shadow-[0_0_8px_rgba(124,58,237,0.4)]":
                  index + 1 === currentStep,
                "bg-slate-200": index + 1 !== currentStep,
              },
            )}
          />
        ))}
      </div>
    </div>
  );
}
