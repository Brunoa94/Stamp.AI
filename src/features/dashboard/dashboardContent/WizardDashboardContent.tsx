"use client";

import {
  UploadCloud,
  Sparkles,
  Image as ImageIcon,
  Shirt,
  Palette,
} from "lucide-react";
import { WizardLayout } from "@/features/ui/wizard-layout";
import { WizardSidebar, WizardStepConfig } from "@/features/ui/wizard-sidebar";
import { WizardSectionHeader } from "@/features/ui/wizard-section-header";
import { WizardContent } from "@/features/ui/wizard-content";
import ImageGenerationForm from "../createProduct/ProductCreateForm/ProductCreateForm";
import { CreateProductSubscriberProvider } from "../createProduct/context/CreateProductContextSubscriber/CreateProductContextSubscriber";
import { CreateProductSelectors } from "../createProduct/context/CreateProductContextSubscriber/selectors";

const wizardSteps: WizardStepConfig[] = [
  {
    id: "form",
    icon: UploadCloud,
    title: "Upload Image",
    description: "Your inspiration source",
  },
  {
    id: "generating",
    icon: Sparkles,
    title: "Generate Prompt",
    description: "AI magic text",
  },
  {
    id: "results",
    icon: ImageIcon,
    title: "Review Design",
    description: "Check the preview",
  },
  {
    id: "customizing",
    icon: Shirt,
    title: "Select Product",
    description: "Pick your style",
  },
  {
    id: "created",
    icon: Palette,
    title: "Color & Size",
    description: "Final touches",
  },
];

// Map workflow steps to step numbers and titles
const stepConfig: Record<
  string,
  { number: number; title: string; description: string }
> = {
  form: {
    number: 1,
    title: "Upload Your Inspiration",
    description:
      "Start by uploading any image—artwork, a photo, or a rough sketch. Our AI will analyze the style and composition to generate a stunning print design.",
  },
  generating: {
    number: 2,
    title: "AI is Working Its Magic",
    description:
      "Our AI is analyzing your image and generating a unique design based on your prompt.",
  },
  results: {
    number: 3,
    title: "Review Your Design",
    description:
      "Check out the AI-generated design. If you love it, continue to product selection!",
  },
  customizing: {
    number: 4,
    title: "Choose Your Product",
    description:
      "Select the perfect product for your design. Choose from t-shirts, hoodies, and more.",
  },
  created: {
    number: 5,
    title: "Customize Details",
    description:
      "Pick your preferred color and size to complete your custom product.",
  },
};

function WizardDashboardWrapper() {
  const currentStep = CreateProductSelectors.currentStep();
  const config = stepConfig[currentStep] || stepConfig.form;

  return (
    <WizardLayout
      sidebar={
        <WizardSidebar
          steps={wizardSteps}
          currentStepId={currentStep}
          completedSteps={[]}
          helpTitle="How it works"
          helpDescription="Upload an image you love, and our AI will transform it into a unique print-ready design for your custom apparel."
        />
      }
    >
      <WizardSectionHeader
        stepNumber={config.number}
        totalSteps={5}
        title={config.title}
        currentStep={config.number}
      />
      <WizardContent
        description={config.description}
        showActions={false}
      >
        <ImageGenerationForm />
      </WizardContent>
    </WizardLayout>
  );
}

const WizardDashboardContent = () => {
  return (
    <section
      className="max-w-7xl mx-auto space-y-12"
      aria-label="AI Magic Studio"
    >
      {/* Page Header */}
      <div className="w-full max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
          Design Your Custom Tee
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8">
          Customize every detail of your perfect t-shirt in just a few simple
          steps
        </p>
        <div className="h-1.5 w-24 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mx-auto shadow-sm" />
      </div>

      {/* Wizard Card */}
      <CreateProductSubscriberProvider>
        <WizardDashboardWrapper />
      </CreateProductSubscriberProvider>
    </section>
  );
};

export default WizardDashboardContent;
