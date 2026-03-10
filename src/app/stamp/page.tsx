import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { CreateProductWizard } from "@/features/stamp/createProduct/components/CreateProductWizard";
import { PageHeader } from "@/features/ui/page-header";
import { theme } from "@/theme";

export default function StampPage() {
  return (
    <ProtectedRoute>
      <div className="grow flex flex-col pb-0 sm:pb-24 px-0 sm:px-6 relative max-w-7xl mx-auto w-full pt-0 sm:pt-4">
        <div className="hidden sm:block">
          <PageHeader
            title="Design Your Custom Tee"
            description="Customize every detail of your perfect t-shirt in just a few simple steps with our advanced AI tools."
          />
        </div>

        <CreateProductWizard />
      </div>
    </ProtectedRoute>
  );
}
