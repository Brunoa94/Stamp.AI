import { WizardPreservationControl } from "./WizardPreservationControl";
import { WizardArtStyleSelector } from "./WizardArtStyleSelector";

interface WizardPromptCustomizationProps {
  disabled: boolean;
}

export function WizardPromptCustomization({
  disabled,
}: WizardPromptCustomizationProps) {
  return (
    <div className="animate-[slideIn_0.35s_ease-out]">
      <WizardPreservationControl disabled={disabled} />

      <WizardArtStyleSelector disabled={disabled} />
    </div>
  );
}
