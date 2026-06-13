import { StampFormProvider } from "@/features/stamp-brutalist/lib/context/StampFormContext";
import { StampFlow } from "@/features/stamp-brutalist/ui/StampFlow";
import { StampMobileProgress } from "@/features/stamp-brutalist/ui/components/StampMobileProgress";

export const metadata = {
  title: "STAMP IT | Create Custom Product",
  description: "Create your custom AI-generated product with STAMP.AI",
};

export default function CreateProductPage() {
  return (
    <StampFormProvider>
      {/* Mobile progress overlay */}
      <div className="fixed top-4 right-8 z-50 lg:hidden">
        <StampMobileProgress />
      </div>

      {/* Main stamp flow */}
      <StampFlow />
    </StampFormProvider>
  );
}
