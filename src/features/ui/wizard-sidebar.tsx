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
  helpTitle = "How it works",
  helpDescription = "Upload an image you love, and our AI will transform it into a unique print-ready design for your custom apparel.",
}: WizardSidebarProps) {
  return (
    <aside className="w-full md:w-80 bg-white flex flex-col">
      <div className="p-8 pb-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
          Creation Steps
        </h2>

        {/* Steps List */}
        <div className="space-y-1">
          {steps.map((step) => (
            <div key={step.id} className="group">
              <WizardStep
                icon={step.icon}
                title={step.title}
                description={step.description}
                isActive={step.id === currentStepId}
                isCompleted={completedSteps.includes(step.id)}
                onClick={() => onStepClick?.(step.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="mt-auto p-6">
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <Info className="text-purple-600 w-5 h-5" />
            <h4 className="font-bold text-slate-900 text-sm">{helpTitle}</h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            {helpDescription}
          </p>
        </div>
      </div>
    </aside>
  );
}
