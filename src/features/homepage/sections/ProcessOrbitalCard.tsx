import { Sparkles } from "lucide-react";
import type { ComponentType } from "react";
import {
  mapProcessStepIndexToOrbitalPalette,
  mapProcessStepIndexToOrbitalTransform,
} from "@/features/homepage/mappers/processOrbitalMapper";
import { mapProcessStepVisualState } from "@/features/homepage/mappers/processStepMapper";

interface ProcessStepItem {
  id: string;
  label: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

interface ProcessOrbitalCardProps {
  step: ProcessStepItem;
  index: number;
  activeProcessStep: number;
}

export function ProcessOrbitalCard({
  step,
  index,
  activeProcessStep,
}: ProcessOrbitalCardProps) {
  const Icon = step.icon;
  const { isActive, isPassed } = mapProcessStepVisualState(
    index,
    activeProcessStep,
    "desktop",
  );
  const orbitalTransform = mapProcessStepIndexToOrbitalTransform(
    index,
    activeProcessStep,
  );
  const palette = mapProcessStepIndexToOrbitalPalette(index);

  return (
    <article
      className={`process-orbit-card group ${isActive ? "process-orbit-card--active" : ""}`}
      style={{
        transform: `translate3d(${orbitalTransform.translateX}px, ${orbitalTransform.translateY}px, ${orbitalTransform.translateZ}px) rotateY(${orbitalTransform.rotateY}deg) scale(${orbitalTransform.scale})`,
        opacity: orbitalTransform.opacity,
        filter: `blur(${orbitalTransform.blur}px)`,
        zIndex: orbitalTransform.zIndex,
      }}
    >
      <div
        className={`process-orbit-color-block bg-linear-to-br ${palette.accent}`}
        aria-hidden="true"
      />
      <div
        className={`process-orbit-giant-number font-heading ${palette.giantNumber}`}
        aria-hidden="true"
      >
        {step.id}
      </div>

      <div className="relative z-10 flex h-full flex-col">
        <div
          className={`process-orbit-accent-bar bg-linear-to-r ${palette.bar}`}
          aria-hidden="true"
        />

        {isActive && (
          <div className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center rounded-full bg-[#7C3AED] text-white shadow-lg shadow-purple-500/40">
            <Sparkles className="h-4 w-4" />
          </div>
        )}

        <div className="mb-8 mt-6 text-5xl font-black tracking-tight text-slate-900">
          {step.id}
        </div>

        <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
          {step.id} / {step.label}
        </span>

        <h3 className="font-heading text-4xl uppercase leading-[0.92] tracking-tight text-slate-900">
          {step.title}
        </h3>

        <div className="mt-5 flex items-center gap-3">
          <span
            className={`h-10 w-10 rounded-full ${palette.glow} flex items-center justify-center border border-slate-300/70`}
          >
            <Icon className="h-4 w-4 text-slate-700" />
          </span>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">
            {isPassed ? "Completed" : isActive ? "In Focus" : "Upcoming"}
          </span>
        </div>

        <p className="mt-5 max-w-md text-base leading-relaxed text-slate-600">
          {step.description}
        </p>
      </div>
    </article>
  );
}
