import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { CreateProductWizard } from "@/features/stamp/createProduct/components/CreateProductWizard";
import { PageHeader } from "@/features/ui/page-header";
import { theme } from "@/theme";

export default function StampPage() {
  return (
    <ProtectedRoute>
      <div className={theme.page.container}>
        <PageHeader
          title="Design Your Custom Tee"
          description="Customize every detail of your perfect t-shirt in just a few simple steps with our advanced AI tools."
        />

        <CreateProductWizard />
      </div>
    </ProtectedRoute>
  );
}
