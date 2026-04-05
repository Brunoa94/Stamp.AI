interface WizardStepHeaderProps {
  stepNumber: string;
  title: string;
  description: string;
  currentDot: number;
  totalDots: number;
}

const dotStyles = {
  active: "w-3 h-3 rounded-sm bg-[#7C3AED]",
  inactive:
    "w-3 h-3 rounded-sm bg-slate-200 transition-colors hover:bg-slate-300",
} as const;

export function WizardStepHeader({
  stepNumber,
  title,
  description,
  currentDot,
  totalDots,
}: WizardStepHeaderProps) {
  return (
    <div className="px-4 sm:px-12 pt-6 sm:pt-14 pb-5 sm:pb-10 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 sm:gap-0">
      <div className="max-w-xl">
        <div className="flex items-center gap-3 mb-3 sm:mb-6">
          <span className="px-3 py-1 bg-[#F3ECFF] text-[#7C3AED] text-xs font-bold font-accent rounded-sm uppercase tracking-widest">
            {stepNumber}
          </span>
          <div className="h-px w-12 bg-slate-200" />
        </div>
        <h2 className="text-3xl sm:text-5xl font-heading text-slate-900 tracking-wide leading-tight">
          {title}
        </h2>
        <p className="text-black-500 mt-2 sm:mt-4 text-sm sm:text-lg font-light font-sans">
          {description}
        </p>
      </div>

      {/* Step dots – hidden on mobile (replaced by MobileStepNav) */}
      <div className="hidden sm:flex gap-3 pb-2">
        {Array.from({ length: totalDots }).map((_, index) => (
          <div
            key={index}
            className={
              index === currentDot ? dotStyles.active : dotStyles.inactive
            }
          />
        ))}
      </div>
    </div>
  );
}
