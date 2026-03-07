/**
 * Visual spacer component to show alignment between steps and header
 * This helps visualize the scroll synchronization
 */
export function WizardStepSpacer() {
  return (
    <div className="relative h-px my-2">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-200/30 to-transparent" />
    </div>
  );
}
