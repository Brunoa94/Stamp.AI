import { processSteps } from "@/features/homepage/lib/constants/homepageContent";
import { SectionHeader } from "@/features/homepage/ui/components/SectionHeader";
import { mapProcessStepVisualState } from "@/features/homepage/lib/mappers/processStepMapper";
import { ProcessOrbitalCard } from "@/features/homepage/ui/sections/ProcessOrbitalCard";

interface PropsI {
  activeProcessStep: number;
}

export function ProcessSection({ activeProcessStep }: PropsI) {
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
        <SectionHeader
          className="mb-8"
          eyebrow="01 / The Journey"
          title={
            <>
              PRECISION IN EVERY
              <br />
              <span className="text-[#7C3AED]">CHOICE</span>.
            </>
          }
          description="Six distinct phases defining the evolution of your apparel identity."
          layout="stack"
          titleSize="xl"
          descriptionClassName="mt-5 max-w-3xl text-lg font-medium leading-relaxed text-slate-500"
        />

        <div className="relative hidden h-190 w-full overflow-visible lg:block">
          <div className="process-orbit-grain" aria-hidden="true" />
          <div
            className="pointer-events-none absolute -right-28 top-10 h-96 w-96 rounded-full bg-[#D946EF]/16 blur-[120px]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -left-24 bottom-8 h-105 w-105 rounded-full bg-[#06B6D4]/12 blur-[140px]"
            aria-hidden="true"
          />
          <div>
            {processSteps.map((step, idx) => {
              return (
                <ProcessOrbitalCard
                  key={step.id}
                  step={step}
                  index={idx}
                  activeProcessStep={activeProcessStep}
                />
              );
            })}
          </div>
        </div>

        <div className="relative flex flex-col gap-10 pl-12 lg:hidden">
          <div className="absolute bottom-4 left-4 top-4 w-0.5 bg-[#7C3AED]" />
          {processSteps.map((step, idx) => {
            const Icon = step.icon;
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
                <span className="mt-1 block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {step.id} / {step.label}
                </span>
                <h3 className="font-heading mt-1 text-lg uppercase text-slate-900">
                  {step.title}
                </h3>
                <div className="mt-3">
                  <Icon className="h-4 w-4 text-slate-500" />
                </div>
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
