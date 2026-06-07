"use client";

import { WizardLayout } from "@/features/ui/wizard-layout";
import { WizardSidebar } from "@/features/ui/wizard-sidebar";
import { WizardSectionHeader } from "@/features/ui/wizard-section-header";
import { WizardContent } from "@/features/ui/wizard-content";
import { PageHeader } from "@/features/ui/page-header";
import { MemoizedWizardProductForm } from "./WizardProductForm";
import { CreateProductSubscriberProvider } from "@/features/stamp/CreateProduct/lib/context/CreateProductContextSubscriber";
import { CreateProductSelectors } from "@/features/stamp/CreateProduct/lib/context/selectors";
import { WIZARD_STEPS } from "./constants/wizardSteps";
import { STEP_CONFIG, TOTAL_STEPS } from "./constants/stepConfig";

// Map step IDs to numeric values for WizardSectionHeader
const stepNumberMap: Record<string, number> = {
  form: 1,
  upload: 1,
  generating: 2,
  synthesis: 2,
  results: 3,
  review: 3,
  customizing: 4,
  fabric: 4,
  creating: 4,
  created: 5,
  sizing: 5,
};

function WizardDashboardWrapper() {
  const currentStep = CreateProductSelectors.currentStep();
  const config = STEP_CONFIG[currentStep] || STEP_CONFIG.form;
  const stepNumber = stepNumberMap[currentStep] || 1;

  return (
    <div id="design-pipeline">
      <WizardLayout
        sidebar={
          <WizardSidebar
            steps={WIZARD_STEPS}
            currentStepId={currentStep}
            completedSteps={[]}
            helpTitle="How it works"
            helpDescription="Upload an image you love, and our AI will transform it into a unique print-ready design for your custom apparel."
          />
        }
      >
        <WizardSectionHeader
          stepNumber={stepNumber}
          totalSteps={TOTAL_STEPS}
          title={config.title}
          currentStep={stepNumber}
        />
        <WizardContent description={config.description} showActions={false}>
          <MemoizedWizardProductForm />
        </WizardContent>
      </WizardLayout>
    </div>
  );
}

const WizardDashboardContent = () => {
  return (
    <section
      className="max-w-5xl mx-auto space-y-12"
      aria-label="AI Magic Studio"
    >
      <PageHeader
        title="Design Your Custom Tee"
        description="Customize every detail of your perfect t-shirt in just a few simple steps"
      />

      <CreateProductSubscriberProvider>
        <WizardDashboardWrapper />
      </CreateProductSubscriberProvider>
    </section>
  );
};

export default WizardDashboardContent;
