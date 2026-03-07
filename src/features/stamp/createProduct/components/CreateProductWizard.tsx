import { shadows } from "@/theme";
import { WizardProductForm } from "../WizardProductForm";
import { CreateProductSubscriberProvider } from "../context/CreateProductContextSubscriber";
import { CreateProductSidebar } from "./CreateProductSidebar";

export function CreateProductWizard() {
  return (
    <CreateProductSubscriberProvider>
      <CreateProductWizardContent />
    </CreateProductSubscriberProvider>
  );
}

function CreateProductWizardContent() {
  return (
    <div
      id="design-pipeline"
      className="max-w-7xl w-full mx-auto bg-white/15 backdrop-blur-xl rounded-lg flex overflow-hidden min-h-187.5 border border-white/30 relative z-10 shadow-2xl"
      style={{ boxShadow: shadows.glass }}
    >
      {/* Sidebar */}
      <CreateProductSidebar />

      {/* Main Content Area */}
      <section className="flex-1 flex flex-col relative bg-white/10">
        <WizardProductForm />
      </section>
    </div>
  );
}
