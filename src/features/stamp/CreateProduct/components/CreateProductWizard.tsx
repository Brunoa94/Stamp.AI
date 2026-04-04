"use client";

import { useCallback, useState } from "react";
import { MemoizedWizardProductForm } from "../WizardProductForm";
import { CreateProductSubscriberProvider } from "../context/CreateProductContextSubscriber";
import { CreateProductSelectors } from "../context/selectors";
import { CreateProductSidebar } from "./CreateProductSidebar";
import { MobileStepNav } from "../mobile/MobileStepNav";
import { FluidInkDriftBackground } from "@/features/ui/fluid-ink-drift-background";
import { useWizardProductFormHandlers } from "../hooks/useWizardProductFormHandlers";
import { WizardCollapsedOverlay } from "./WizardCollapsedOverlay";
import {
  getWizardContainerClassName,
  getWizardMainContentClassName,
  getWizardMobileNavClassName,
  getWizardSidebarClassName,
} from "../helpers/wizardLayoutClassNames";

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

  const handleExpand = useCallback(() => {
    if (isExpanded) return;

    setIsExpanded(true);

    scrollToWizard();
  }, [isExpanded, scrollToWizard]);

  const wizardContainerClassName = getWizardContainerClassName({
    currentStep,
    isExpanded,
  });

  return (
    <>
      {/* Fluid ink background – mobile only; desktop already has page-level bg */}
      <div className="md:hidden">
        <FluidInkDriftBackground />
      </div>

      <div
        id="design-pipeline"
        data-state={isExpanded ? "expanded" : "collapsed"}
        className={wizardContainerClassName}
      >
        {/* Mobile horizontal step nav – hidden on md+ */}
        <div className={getWizardMobileNavClassName(isExpanded)}>
          <MobileStepNav />
        </div>

        {/* Sidebar – hidden on mobile, shown md+ */}
        <div className={getWizardSidebarClassName(isExpanded)}>
          <CreateProductSidebar />
        </div>

        {/* Main Content Area */}
        <section
          className={getWizardMainContentClassName(isExpanded)}
          data-wizard-scroll-container="true"
        >
          <MemoizedWizardProductForm />
        </section>

        <WizardCollapsedOverlay
          isExpanded={isExpanded}
          onExpand={handleExpand}
        />
      </div>
    </>
  );
}
