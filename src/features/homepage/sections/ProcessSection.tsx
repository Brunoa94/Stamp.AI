import { Sparkles } from "lucide-react";
import {
  journeyDesktopPositions,
  processSteps,
} from "@/features/homepage/constants/homepageContent";
import { mapProcessStepVisualState } from "@/features/homepage/mappers/processStepMapper";

interface ProcessSectionProps {
  activeProcessStep: number;
}

export function ProcessSection({ activeProcessStep }: ProcessSectionProps) {
  return (
    <section
      id="process"
      className="relative overflow-hidden border-b border-slate-200 bg-linear-to-br from-[#7C3AED]/10 via-slate-50 to-[#06B6D4]/10 py-12"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-[#7C3AED]/16 via-transparent to-[#06B6D4]/14"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-[#7C3AED]/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[#06B6D4]/18 blur-3xl"
        aria-hidden="true"
      />
      <div className="mx-auto w-full max-w-360 px-6 md:px-16 xl:px-24">
        <div className="mb-24 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <span className="mb-4 block text-[12px] font-bold uppercase tracking-[0.2em] text-slate-400">
              01 / The Journey
            </span>
            <h2 className="font-heading text-6xl uppercase leading-[0.85] tracking-tight text-slate-900 md:text-7xl">
              PRECISION IN EVERY
              <br />
              <span className="text-[#7C3AED]">CHOICE</span>.
            </h2>
          </div>
          <p className="text-lg font-medium leading-relaxed text-slate-500">
            Six distinct phases defining the evolution of your apparel identity.
          </p>
        </div>

        <div className="relative hidden h-175 w-full lg:block">
          <svg
            className="pointer-events-none absolute inset-0 z-0 h-full w-full"
            viewBox="0 0 1200 700"
            preserveAspectRatio="none"
          >
            <path
              d="M 90,120 C 150,120 200,420 300,420 C 400,420 450,120 550,120 C 650,120 700,420 800,420 C 900,420 950,120 1050,120 C 1150,120 1150,420 1200,420"
              fill="none"
              stroke="#7C3AED"
              strokeWidth="4"
              className="opacity-70"
            />
          </svg>

          {processSteps.map((step, idx) => {
            const Icon = step.icon;
            const { isActive, stepAccent, cardStateClass } =
              mapProcessStepVisualState(idx, activeProcessStep, "desktop");

            return (
              <div
                key={step.id}
                className={`absolute z-10 w-40 ${journeyDesktopPositions[idx]}`}
              >
                <article
                  className={`glass-card relative rounded-lg border p-5 transition-all duration-300 ${cardStateClass}`}
                >
                  <div
                    className={`pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-lg bg-linear-to-r ${stepAccent}`}
                    aria-hidden="true"
                  />
                  {isActive && (
                    <div className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#7C3AED] text-white">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  )}

                  <div className="font-heading text-5xl text-[#7C3AED]">
                    {step.id}
                  </div>
                  <span className="mb-2 mt-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {step.id} / {step.label}
                  </span>
                  <h3 className="font-heading text-lg uppercase leading-tight text-slate-900">
                    {step.title}
                  </h3>
                  <div className="mt-3">
                    <Icon className="h-4 w-4 text-slate-400" />
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                    {step.description}
                  </p>
                </article>
              </div>
            );
          })}
        </div>

        <div className="relative flex flex-col gap-10 pl-12 lg:hidden">
          <div className="absolute bottom-4 left-4 top-4 w-0.5 bg-[#7C3AED]" />
          {processSteps.map((step, idx) => {
            const { stepAccent, cardStateClass } = mapProcessStepVisualState(
              idx,
              activeProcessStep,
              "mobile",
            );

            return (
              <article
                key={step.id}
                className={`glass-card relative rounded-lg border p-5 transition-all duration-300 ${cardStateClass}`}
              >
                <div
                  className={`pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-lg bg-linear-to-r ${stepAccent}`}
                  aria-hidden="true"
                />
                <div className="absolute -left-10 top-6 h-4 w-4 rounded-full bg-[#7C3AED] ring-4 ring-white" />
                <div className="font-heading text-4xl text-[#7C3AED]">
                  {step.id}
                </div>
                <h3 className="font-heading mt-1 text-lg uppercase text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs text-slate-500">
                  {step.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
