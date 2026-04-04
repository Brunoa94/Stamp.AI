import { LucideIcon, Info } from "lucide-react";
import { WizardStep } from "./wizard-step";

export interface WizardStepConfig {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

interface WizardSidebarProps {
  steps: WizardStepConfig[];
  currentStepId: string;
  onStepClick?: (stepId: string) => void;
  completedSteps?: string[];
  helpTitle?: string;
  helpDescription?: string;
}

export function WizardSidebar({
  steps,
  currentStepId,
  onStepClick,
  completedSteps = [],
  helpTitle = "Pro Tip",
  helpDescription = "High-resolution PNGs with transparent backgrounds work best for our AI generator.",
}: WizardSidebarProps) {
  return (
    <aside className="w-80 border-r border-white/20 flex flex-col min-h-[750px]">
      <div className="p-8 pb-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.25em] mb-10 border-b border-slate-200 pb-2 font-accent">
          Design Pipeline
        </h2>

        {/* Steps List */}
        <div className="space-y-4">
          {steps.map((step) => (
            <WizardStep
              key={step.id}
              icon={step.icon}
              title={step.title}
              description={step.description}
              isActive={step.id === currentStepId}
              isCompleted={completedSteps.includes(step.id)}
              onClick={() => onStepClick?.(step.id)}
            />
          ))}
        </div>
      </div>

      {/* Sidebar Info Box */}
      <div className="mt-auto p-8">
        <div className="bg-white/30 rounded-lg p-6 border border-white/20 backdrop-blur-sm shadow-sm">
          <div className="flex items-center gap-2 mb-3 text-[#7C3AED]">
            <Info className="text-lg" />
            <span className="font-bold text-xs uppercase tracking-wider font-accent">
              {helpTitle}
            </span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed font-accent">
            {helpDescription}
          </p>
        </div>
      </div>
    </aside>
  );
}
