interface IconProps {
  className?: string;
}

interface WizardStepAssetIconProps extends IconProps {
  assetPath: string;
}

function WizardStepAssetIcon({
  className,
  assetPath,
}: WizardStepAssetIconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <use href={`${assetPath}#icon`} />
    </svg>
  );
}

/** Step 1 – Upload Artwork (Cloud with Up Arrow) */
export function UploadArtworkIcon({ className }: IconProps) {
  return (
    <WizardStepAssetIcon
      className={className}
      assetPath="/assets/wizard-icons/upload-artwork.svg"
    />
  );
}

/** Step 2 – AI Synthesis (Magic Wand / Sparkles) */
export function AISynthesisIcon({ className }: IconProps) {
  return (
    <WizardStepAssetIcon
      className={className}
      assetPath="/assets/wizard-icons/ai-synthesis.svg"
    />
  );
}

/** Step 3 – Final Review (Eye with search detail) */
export function FinalReviewIcon({ className }: IconProps) {
  return (
    <WizardStepAssetIcon
      className={className}
      assetPath="/assets/wizard-icons/final-review.svg"
    />
  );
}

/** Step 4 – Fabric Style (T-shirt / Textile Outline) */
export function FabricStyleIcon({ className }: IconProps) {
  return (
    <WizardStepAssetIcon
      className={className}
      assetPath="/assets/wizard-icons/fabric-style.svg"
    />
  );
}

/** Step 5 – Sizing & Fit (Focus Frame with center dot) */
export function SizingFitIcon({ className }: IconProps) {
  return (
    <WizardStepAssetIcon
      className={className}
      assetPath="/assets/wizard-icons/sizing-fit.svg"
    />
  );
}
