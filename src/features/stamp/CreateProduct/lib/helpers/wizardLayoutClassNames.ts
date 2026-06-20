import clsx from "clsx";

interface WizardContainerClassNameParams {
  currentStep: string;
  isExpanded: boolean;
}

interface WizardSectionVisibilityI {
  isResultsStep: boolean;
  isGeneratingStep: boolean;
  showCreatingSection: boolean;
  showSizingSection: boolean;
}

export function getWizardContainerClassName({
  currentStep,
  isExpanded,
}: WizardContainerClassNameParams) {
  return clsx(
    "w-full md:mx-auto bg-white/45 md:bg-white/60 backdrop-blur-xl md:backdrop-blur-sm rounded-3xl md:rounded-lg flex flex-col md:flex-row overflow-hidden border border-white/45 md:border-white/40 relative z-10 shadow-[0_20px_45px_-15px_rgba(15,23,42,0.35),inset_0_1px_0_rgba(255,255,255,0.45)] md:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.05),inset_0_0_0_1px_rgba(255,255,255,0.25)] transition-all duration-700 ease-in-out",
    !isExpanded
      ? "h-55 md:h-62.5 cursor-pointer"
      : currentStep === "sizing"
        ? "md:h-320"
        : "md:h-240",
  );
}

export function getWizardMobileNavClassName(isExpanded: boolean) {
  return clsx(
    "transition-all duration-500 ease-out",
    isExpanded
      ? "opacity-100 translate-y-0"
      : "opacity-0 -translate-y-3 pointer-events-none",
  );
}

export function getWizardSidebarClassName(isExpanded: boolean) {
  return clsx(
    "hidden md:block transition-all duration-500 ease-out",
    isExpanded
      ? "opacity-100 translate-x-0"
      : "opacity-0 -translate-x-3 pointer-events-none",
  );
}

export function getWizardMainContentClassName(isExpanded: boolean) {
  return clsx(
    "flex-1 flex flex-col relative bg-white/10 overflow-y-auto transition-all duration-500 ease-out",
    isExpanded
      ? "opacity-100 translate-y-0"
      : "opacity-0 translate-y-5 pointer-events-none",
  );
}

export function getWizardFormClassName(showSizingSection: boolean) {
  return clsx(
    "flex-1 px-4 sm:px-12 relative",
    "overflow-hidden",
  );
}

export function shouldShowWizardFooter(sections: WizardSectionVisibilityI) {
  return (
    !sections.isResultsStep &&
    !sections.isGeneratingStep &&
    !sections.showCreatingSection &&
    !sections.showSizingSection
  );
}
