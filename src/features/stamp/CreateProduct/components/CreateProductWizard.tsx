"use client";

import { WizardProductForm } from "../WizardProductForm";
import clsx from "clsx";
import { CreateProductSubscriberProvider } from "../context/CreateProductContextSubscriber";
import { CreateProductSelectors } from "../context/selectors";
import { CreateProductSidebar } from "./CreateProductSidebar";
import { MobileStepNav } from "../mobile/MobileStepNav";
import { FluidInkDriftBackground } from "@/features/ui/fluid-ink-drift-background";

export function CreateProductWizard() {
  return (
    <CreateProductSubscriberProvider>
      <CreateProductWizardContent />
    </CreateProductSubscriberProvider>
  );
}

function CreateProductWizardContent() {
  const currentStep = CreateProductSelectors.currentStep();

  return (
    <>
      {/* Fluid ink background – mobile only; desktop already has page-level bg */}
      <div className="md:hidden">
        <FluidInkDriftBackground />
      </div>

      <div
        id="design-pipeline"
        className={clsx(
          "max-w-7xl w-full md:mx-auto bg-white/45 md:bg-white/60 backdrop-blur-xl md:backdrop-blur-sm rounded-3xl md:rounded-lg flex flex-col md:flex-row overflow-hidden border border-white/45 md:border-white/40 relative z-10 shadow-[0_20px_45px_-15px_rgba(15,23,42,0.35),inset_0_1px_0_rgba(255,255,255,0.45)] md:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.05),inset_0_0_0_1px_rgba(255,255,255,0.25)]",
          currentStep === "sizing" ? "md:h-320" : "md:h-240",
        )}
      >
        {/* Mobile horizontal step nav – hidden on md+ */}
        <MobileStepNav />

        {/* Sidebar – hidden on mobile, shown md+ */}
        <div className="hidden md:block">
          <CreateProductSidebar />
        </div>

        {/* Main Content Area */}
        <section
          className="flex-1 flex flex-col relative bg-white/10 overflow-y-auto"
          data-wizard-scroll-container="true"
        >
          <WizardProductForm />
        </section>
      </div>
    </>
  );
}
