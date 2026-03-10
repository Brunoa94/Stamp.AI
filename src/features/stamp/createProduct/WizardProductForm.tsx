"use client";

import dynamic from "next/dynamic";
import { Activity } from "react";
import { CreateProductSelectors } from "./context/selectors";
import { useCreateProductSubscriberActions } from "./context/actions";
import { useImageGeneration } from "@/queries";
import { IProductCreateForm } from "@/schemas/productCreateSchema";
import { STEP_CONFIG } from "./constants/stepConfig";
import { useProductCreation } from "./hooks/useProductCreation";
import useScrollToSection from "@/hooks/useScrollToSection";
import { WizardStepHeader } from "@/features/ui/wizard-step-header";
import { CreateProductActionFooter } from "./components/CreateProductActionFooter";
import { getVisibleSections } from "./utils/stepHelpers";

// Dynamic imports for step components
const UploadStep = dynamic(
  () =>
    import("./steps/UploadStep/UploadStep").then((mod) => ({
      default: mod.UploadStep,
    })),
  {
    loading: () => <div>Loading...</div>,
  },
);

const SynthesisStep = dynamic(
  () =>
    import("./steps/SynthesisStep/SynthesisStep").then((mod) => ({
      default: mod.SynthesisStep,
    })),
  {
    loading: () => <div>Loading...</div>,
  },
);

const ProcessingStep = dynamic(
  () =>
    import("./steps/ProcessingStep/ProcessingStep").then((mod) => ({
      default: mod.ProcessingStep,
    })),
  {
    loading: () => <div>Loading...</div>,
  },
);

const ResultsStep = dynamic(
  () =>
    import("./steps/ResultsStep/ResultsStep").then((mod) => ({
      default: mod.ResultsStep,
    })),
  {
    loading: () => <div>Loading...</div>,
  },
);

const CustomizerStep = dynamic(
  () =>
    import("./steps/CustomizerStep/CustomizerStep").then((mod) => ({
      default: mod.CustomizerStep,
    })),
  {
    loading: () => <div>Loading...</div>,
  },
);

const FabricStep = dynamic(
  () =>
    import("./steps/FabricStep/FabricStep").then((mod) => ({
      default: mod.FabricStep,
    })),
  {
    loading: () => <div>Loading...</div>,
  },
);

const CreatingStep = dynamic(
  () =>
    import("./steps/CreatingStep/CreatingStep").then((mod) => ({
      default: mod.CreatingStep,
    })),
  {
    loading: () => <div>Loading...</div>,
  },
);

const SizingStep = dynamic(
  () =>
    import("./steps/SizingStep/SizingStep").then((mod) => ({
      default: mod.SizingStep,
    })),
  {
    loading: () => <div>Loading...</div>,
  },
);

export function WizardProductForm() {
  // Selectors
  const currentStep = CreateProductSelectors.currentStep();
  const form = CreateProductSelectors.form();
  const selectedTshirt = CreateProductSelectors.selectedTshirt();
  const generatedResult = CreateProductSelectors.generatedResult();

  // Actions
  const {
    handleFormSubmit,
    handleGenerationSuccess,
    handleGenerationError,
    handleMoveToSynthesis,
  } = useCreateProductSubscriberActions();

  // Mutations
  const { mutate: generateImage } = useImageGeneration();

  // Custom hooks
  const { handleCreateProduct } = useProductCreation();
  const { smoothScrollToElementById } = useScrollToSection();

  if (!form) {
    return null;
  }

  const { handleSubmit } = form;

  // Form submission handler
  const onSubmit = (data: IProductCreateForm) => {
    handleFormSubmit();

    generateImage(data, {
      onSuccess: (result) => {
        handleGenerationSuccess(result);
      },
      onError: (error) => {
        handleGenerationError(error);
      },
    });
  };

  // Step configuration and visibility
  const stepConfig =
    STEP_CONFIG[currentStep as keyof typeof STEP_CONFIG] || STEP_CONFIG.upload;
  const sections = getVisibleSections(currentStep);

  // Continue handler
  const handleContinue = () => {
    if (sections.isUploadStep) {
      handleMoveToSynthesis();
      smoothScrollToElementById("design-pipeline", {
        block: "start",
        delay: 150,
        offset: -48,
      });
    } else if (sections.isSynthesisStep) {
      handleSubmit(onSubmit)();
      smoothScrollToElementById("design-pipeline", {
        block: "start",
        delay: 150,
        offset: -48,
      });
    } else if (currentStep === "fabric") {
      handleCreateProduct(generatedResult, selectedTshirt);
      smoothScrollToElementById("design-pipeline", {
        block: "start",
        delay: 150,
        offset: -48,
      });
    }
  };

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
        <ResultsStep sectionRef={{ current: null }} />
      </Activity>

      {/* Content Area - Hidden on results step */}
      {!sections.isResultsStep && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 px-4 sm:px-12 pb-32 sm:pb-10 relative overflow-hidden"
          data-wizard-content
        >
          <div className="h-full">
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
                  <ProcessingStep sectionRef={{ current: null }} />
                </Activity>
              </>
            )}

            {/* Customizer Step */}
            <Activity
              mode={sections.showCustomizerSection ? "visible" : "hidden"}
            >
              <CustomizerStep sectionRef={{ current: null }} />
            </Activity>

            {/* Fabric Step */}
            <Activity mode={sections.showFabricSection ? "visible" : "hidden"}>
              <FabricStep sectionRef={{ current: null }} />
            </Activity>

            {/* Creating Step (Loading) */}
            <Activity
              mode={sections.showCreatingSection ? "visible" : "hidden"}
            >
              <CreatingStep sectionRef={{ current: null }} />
            </Activity>

            {/* Sizing Step (Product Confirmation) */}
            <Activity mode={sections.showSizingSection ? "visible" : "hidden"}>
              <SizingStep sectionRef={{ current: null }} />
            </Activity>
          </div>
        </form>
      )}

      {/* Action Footer - Hidden on results, creating, and sizing steps */}
      {!sections.isResultsStep &&
        !sections.showCreatingSection &&
        !sections.showSizingSection && (
          <CreateProductActionFooter
            onCancel={() => window.history.back()}
            onContinue={handleContinue}
          />
        )}
    </>
  );
}
