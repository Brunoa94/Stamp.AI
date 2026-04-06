import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { CreateProductWizard } from "@/features/stamp/CreateProduct/components/CreateProductWizard";
import { PageHeader } from "@/features/ui/page-header";

export default function StampPage() {
  return (
    <ProtectedRoute>
      <div className="grow flex flex-col pb-0 sm:pb-24 relative max-w-9xl mx-auto w-full">
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
