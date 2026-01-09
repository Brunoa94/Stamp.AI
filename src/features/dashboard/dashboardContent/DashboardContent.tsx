import ImageGenerationForm from "../createImage/ImageGenerationForm/ImageGenerationForm";
import DashboardHeader from "../dashboardHeader/DashboardHeader";
const DashboardContent = () => {
  return (
    <section
      className="max-w-6xl mx-auto space-y-12"
      aria-label="AI Magic Studio"
    >
      <DashboardHeader route="dashboard" />
      <ImageGenerationForm />
    </section>
  );
};

export default DashboardContent;
