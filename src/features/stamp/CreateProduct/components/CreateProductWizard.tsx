"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MemoizedWizardProductForm } from "../WizardProductForm";
import { CreateProductSubscriberProvider } from "../context/CreateProductContextSubscriber";
import { CreateProductSelectors } from "../context/selectors";
import { CreateProductSidebar } from "./CreateProductSidebar";
import { MobileStepNav } from "../mobile/MobileStepNav";
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
  const searchParams = useSearchParams();
  const currentStep = CreateProductSelectors.currentStep();
  const [isExpanded, setIsExpanded] = useState(false);
  const { scrollToWizard } = useWizardProductFormHandlers({ form: null });

  useEffect(() => {
    const sourceOrderId = searchParams.get("sourceOrder");
    if (!sourceOrderId) return;

    setIsExpanded(true);
    scrollToWizard();
  }, [searchParams, scrollToWizard]);

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
