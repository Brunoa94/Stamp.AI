import clsx from "clsx";
import { LucideIcon } from "lucide-react";

interface WizardStepProps {
  icon: LucideIcon;
  title: string;
  description: string;
  isActive?: boolean;
  isCompleted?: boolean;
  onClick?: () => void;
}

export function WizardStep({
  icon: Icon,
  title,
  description,
  isActive = false,
  isCompleted = false,
  onClick,
}: WizardStepProps) {
  return (
    <div
      className={clsx(
        "flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all",
        {
          // Active state
          "bg-gradient-to-r from-purple-50/50 via-transparent to-transparent border-r-3 border-purple-600":
            isActive,
          // Inactive state
          "hover:bg-slate-50": !isActive,
        }
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-current={isActive ? "step" : undefined}
    >
      <div
        className={clsx(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all",
          {
            // Active icon
            "bg-gradient-to-br from-purple-600 to-violet-700 text-white shadow-lg shadow-purple-500/25":
              isActive,
            // Completed icon
            "bg-green-500 text-white": isCompleted && !isActive,
            // Inactive icon
            "bg-slate-100 text-slate-400 border border-slate-200":
              !isActive && !isCompleted,
            // Hover effect for inactive
            "group-hover:border-purple-600/30 group-hover:text-purple-600":
              !isActive && !isCompleted,
          }
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3
          className={clsx("font-bold text-sm transition-colors", {
            "text-slate-900": isActive,
            "text-slate-500 group-hover:text-slate-900": !isActive,
          })}
        >
          {title}
        </h3>
        <p
          className={clsx("text-xs mt-0.5 transition-colors", {
            "text-slate-600": isActive,
            "text-slate-400 group-hover:text-slate-500": !isActive,
          })}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
