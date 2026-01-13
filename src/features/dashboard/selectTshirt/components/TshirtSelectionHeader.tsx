import StepIndicator from "@/features/ui/step-indicator";

export default function TshirtSelectionHeader() {
  return (
    <div className="space-y-6">
      {/* Step Header */}
      <StepIndicator
        stepNumber="4"
        title="Choose T-shirt Type"
        isActive={true}
        className="group"
      />

      {/* Description */}
      <div className="bg-linear-to-br from-blue-50/50 via-blue-100/40 to-purple-50/50 dark:from-gray-800/80 dark:via-blue-800/30 dark:to-purple-800/30 backdrop-blur-sm border border-blue-100 dark:border-blue-800/30 rounded-2xl p-6">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Select the perfect t-shirt type for your design. Each option offers
          different materials, fits, and price points to match your needs and
          budget.
        </p>
      </div>
    </div>
  );
}
