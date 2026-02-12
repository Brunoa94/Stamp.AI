import { PageHeader } from "@/features/ui/page-header";
import ImageGenerationForm from "../createImage/ImageGenerationForm/ImageGenerationForm";
import { CreateProductSubscriberProvider } from "../createImage/context/CreateProductContextSubscriber";
import { Sparkles } from "lucide-react";

const DashboardContent = () => {
  return (
    <section
      className="max-w-6xl mx-auto space-y-12"
      aria-label="AI Magic Studio"
    >
      <PageHeader
        title="Stamp your favourite image!"
        subtitle="Now it's time to personalize your favourite picture. Start by uploading it and then write on the input label what your creativity tells on. I hope to create memorable items!"
        icon={Sparkles}
      />
      <CreateProductSubscriberProvider>
        <ImageGenerationForm />
      </CreateProductSubscriberProvider>
    </section>
  );
};

export default DashboardContent;
