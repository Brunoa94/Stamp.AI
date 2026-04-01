"use client";

import { useState } from "react";
import { WizardProductForm } from "../WizardProductForm";
import clsx from "clsx";
import { CreateProductSubscriberProvider } from "../context/CreateProductContextSubscriber";
import { CreateProductSelectors } from "../context/selectors";
import { CreateProductSidebar } from "./CreateProductSidebar";
import { MobileStepNav } from "../mobile/MobileStepNav";
import { FluidInkDriftBackground } from "@/features/ui/fluid-ink-drift-background";
import { useWizardProductFormHandlers } from "../hooks/useWizardProductFormHandlers";
import { WizardCollapsedOverlay } from "./WizardCollapsedOverlay";

export function CreateProductWizard() {
  return (
    <CreateProductSubscriberProvider>
      <CreateProductWizardContent />
    </CreateProductSubscriberProvider>
  );
}

function CreateProductWizardContent() {
  const currentStep = CreateProductSelectors.currentStep();
  const [isExpanded, setIsExpanded] = useState(false);
  const { scrollToWizard } = useWizardProductFormHandlers({ form: null });

  const handleExpand = () => {
    if (isExpanded) return;

    setIsExpanded(true);

    scrollToWizard();
  };

  return (
    <>
      {/* Fluid ink background – mobile only; desktop already has page-level bg */}
      <div className="md:hidden">
        <FluidInkDriftBackground />
      </div>

      <div
        id="design-pipeline"
        data-state={isExpanded ? "expanded" : "collapsed"}
        className={clsx(
          "max-w-7xl w-full md:mx-auto bg-white/45 md:bg-white/60 backdrop-blur-xl md:backdrop-blur-sm rounded-3xl md:rounded-lg flex flex-col md:flex-row overflow-hidden border border-white/45 md:border-white/40 relative z-10 shadow-[0_20px_45px_-15px_rgba(15,23,42,0.35),inset_0_1px_0_rgba(255,255,255,0.45)] md:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.05),inset_0_0_0_1px_rgba(255,255,255,0.25)] transition-all duration-700 ease-in-out",
          !isExpanded
            ? "h-55 md:h-62.5 cursor-pointer"
            : currentStep === "sizing"
              ? "md:h-320"
              : "md:h-240",
        )}
      >
        {/* Mobile horizontal step nav – hidden on md+ */}
        <div
          className={clsx(
            "transition-all duration-500 ease-out",
            isExpanded
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-3 pointer-events-none",
          )}
        >
          <MobileStepNav />
        </div>

        {/* Sidebar – hidden on mobile, shown md+ */}
        <div
          className={clsx(
            "hidden md:block transition-all duration-500 ease-out",
            isExpanded
              ? "opacity-100 translate-x-0"
              : "opacity-0 -translate-x-3 pointer-events-none",
          )}
        >
          <CreateProductSidebar />
        </div>

        {/* Main Content Area */}
        <section
          className={clsx(
            "flex-1 flex flex-col relative bg-white/10 overflow-y-auto transition-all duration-500 ease-out",
            isExpanded
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-5 pointer-events-none",
          )}
          data-wizard-scroll-container="true"
        >
          <WizardProductForm />
        </section>

        <WizardCollapsedOverlay isExpanded={isExpanded} onExpand={handleExpand} />
      </div>
    </>
  );
}
