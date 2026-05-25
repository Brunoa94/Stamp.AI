import clsx from "clsx";

interface WizardStepProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  isActive?: boolean;
  isCompleted?: boolean;
  onClick?: () => void;
}

const stepStyles = {
  container:
    "flex items-center gap-4 p-5 rounded transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group cursor-pointer",
  active:
    "bg-gradient-to-r from-[#F3ECFF] to-transparent border-r-[3px] border-[#7C3AED]",
  iconBox:
    "w-12 h-12 rounded-sm flex items-center justify-center shrink-0 border transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
  iconActive:
    "bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] text-white shadow-[0_4px_12px_rgba(124,58,237,0.25)]",
  iconInactive:
    "border-white/30 text-slate-400 group-hover:border-[#7C3AED]/30 group-hover:text-[#7C3AED] bg-white/30",
} as const;

export function WizardStep({
  icon: Icon,
  title,
  description,
  isActive = false,
  onClick,
}: WizardStepProps) {
  return (
    <div
      className={clsx(stepStyles.container, {
        [stepStyles.active]: isActive,
      })}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-current={isActive ? "step" : undefined}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div
        className={clsx(stepStyles.iconBox, {
          [stepStyles.iconActive]: isActive,
          [stepStyles.iconInactive]: !isActive,
        })}
      >
        <Icon className="text-2xl" />
      </div>
      <div>
        <h3
          className={clsx(
            "font-heading text-xl font-bold tracking-widest transition-all duration-300 ease-in-out",
            {
              "text-slate-900": isActive,
              "text-slate-400 group-hover:text-slate-900": !isActive,
            },
          )}
        >
          {title}
        </h3>
        <p
          className={clsx("text-xs font-medium mt-0.5 font-accent", {
            "text-slate-500": isActive,
            "text-slate-400": !isActive,
          })}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
