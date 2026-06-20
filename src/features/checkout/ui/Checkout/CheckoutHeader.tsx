import { PageHeader } from "@/shared/ui/PageHeader";

/**
 * Checkout page header matching cart design system
 */
export const CheckoutHeader = () => {
  return (
    <PageHeader
      title="Check"
      highlightedWord="out"
      subtitle="Complete your order"
      className="mb-12"
    />
  );
};
