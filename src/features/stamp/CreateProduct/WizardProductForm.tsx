"use client";

import dynamic from "next/dynamic";
import { Activity } from "react";
import { memo } from "react";
import { useEffect } from "react";
import { CreateProductSelectors } from "./context/selectors";
import { WizardStepHeader } from "@/features/ui/wizard-step-header";
import { CreateProductActionFooter } from "./components/CreateProductActionFooter";
import { WizardStepLoadingState } from "./components/WizardStepLoadingState";
import { useWizardProductFormHandlers } from "./hooks/useWizardProductFormHandlers";
import {
  getWizardFormClassName,
  shouldShowWizardFooter,
} from "./helpers/wizardLayoutClassNames";

// Dynamic imports for step components
const UploadStep = dynamic(
  () =>
    import("./steps/UploadStep/UploadStep").then((mod) => ({
      default: mod.UploadStep,
    })),
  {
    loading: () => <WizardStepLoadingState />,
  },
);

const SynthesisStep = dynamic(
  () =>
    import("./steps/SynthesisStep/SynthesisStep").then((mod) => ({
      default: mod.SynthesisStep,
    })),
  {
    loading: () => <WizardStepLoadingState />,
  },
);

const ProcessingStep = dynamic(
  () =>
    import("./steps/ProcessingStep/ProcessingStep").then((mod) => ({
      default: mod.ProcessingStep,
    })),
  {
    loading: () => <WizardStepLoadingState />,
  },
);

const ResultsStep = dynamic(
  () =>
    import("./steps/ResultsStep/ResultsStep").then((mod) => ({
      default: mod.ResultsStep,
    })),
  {
    loading: () => <WizardStepLoadingState />,
  },
);

const CustomizerStep = dynamic(
  () =>
    import("./steps/CustomizerStep/CustomizerStep").then((mod) => ({
      default: mod.CustomizerStep,
    })),
  {
    loading: () => <WizardStepLoadingState />,
  },
);

const FabricStep = dynamic(
  () =>
    import("./steps/FabricStep/FabricStep").then((mod) => ({
      default: mod.FabricStep,
    })),
  {
    loading: () => <WizardStepLoadingState />,
  },
);

const CreatingStep = dynamic(
  () =>
    import("./steps/CreatingStep/CreatingStep").then((mod) => ({
      default: mod.CreatingStep,
    })),
  {
    loading: () => <WizardStepLoadingState />,
  },
);

const SizingStep = dynamic(
  () =>
    import("./steps/SizingStep/SizingStep").then((mod) => ({
      default: mod.SizingStep,
    })),
  {
    loading: () => <WizardStepLoadingState />,
  },
);

const EMPTY_SECTION_REF = { current: null };
const STAMP_GENERATED_HISTORY_STORAGE_KEY =
  "stamp:create-product:generated-history";

export function WizardProductForm() {
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(STAMP_GENERATED_HISTORY_STORAGE_KEY);
      }
    };
  }, []);

  const form = CreateProductSelectors.form();
  const {
    stepConfig,
    sections,
    handleBack,
    handleContinue,
    formSubmitHandler,
    isAddedToCart,
    isAddToCartPending,
  } = useWizardProductFormHandlers({ form });

  const formClassName = getWizardFormClassName(sections.showSizingSection);

  const showFooter = shouldShowWizardFooter(sections);

  if (!form) {
    return null;
  }

  return (
    <>
      {/* Step Header - Hidden on results step */}
      {!sections.isResultsStep && (
        <WizardStepHeader
          stepNumber={stepConfig.number}
          title={stepConfig.title}
          description={stepConfig.description}
          currentDot={stepConfig.dotIndex}
          totalDots={5}
        />
      )}

      {/* Results Step - Takes full area */}
      <Activity mode={sections.isResultsStep ? "visible" : "hidden"}>
        <ResultsStep sectionRef={EMPTY_SECTION_REF} />
      </Activity>

      {/* Content Area - Hidden on results step */}
      {!sections.isResultsStep && (
        <form
          onSubmit={formSubmitHandler}
          className={formClassName}
          data-wizard-content
        >
          <div className={sections.showSizingSection ? "h-full" : "h-full"}>
            {sections.showFormSection && (
              <>
                {/* Upload Step */}
                <Activity mode={sections.isUploadStep ? "visible" : "hidden"}>
                  <UploadStep />
                </Activity>

                {/* Synthesis Step */}
                <Activity
                  mode={sections.isSynthesisStep ? "visible" : "hidden"}
                >
                  <SynthesisStep />
                </Activity>

                {/* Processing Step */}
                <Activity
                  mode={sections.isGeneratingStep ? "visible" : "hidden"}
                >
                  <ProcessingStep sectionRef={EMPTY_SECTION_REF} />
                </Activity>
              </>
            )}

            {/* Customizer Step */}
            <Activity
              mode={sections.showCustomizerSection ? "visible" : "hidden"}
            >
              <CustomizerStep sectionRef={EMPTY_SECTION_REF} />
            </Activity>

            {/* Fabric Step */}
            <Activity mode={sections.showFabricSection ? "visible" : "hidden"}>
              <FabricStep sectionRef={EMPTY_SECTION_REF} />
            </Activity>

            {/* Creating Step (Loading) */}
            <Activity
              mode={sections.showCreatingSection ? "visible" : "hidden"}
            >
              <CreatingStep sectionRef={EMPTY_SECTION_REF} />
            </Activity>

            {/* Sizing Step (Product Confirmation) */}
            <Activity mode={sections.showSizingSection ? "visible" : "hidden"}>
              <SizingStep
                sectionRef={EMPTY_SECTION_REF}
                isAddedToCart={isAddedToCart}
                isPending={isAddToCartPending}
                isActive={sections.showSizingSection}
              />
            </Activity>
          </div>
        </form>
      )}

      {/* Action Footer - Hidden on results, creating, and sizing steps */}
      {showFooter && (
        <CreateProductActionFooter
          onBack={handleBack}
          onContinue={handleContinue}
        />
      )}
    </>
  );
}

export const MemoizedWizardProductForm = memo(WizardProductForm);
