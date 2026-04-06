interface IconProps {
  className?: string;
}

interface AssetIconProps extends IconProps {
  src: string;
}

function AssetIcon({ className, src }: AssetIconProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-6 w-6 shrink-0 bg-current ${className ?? ""}`}
      style={{
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}

/** Step 1 – Upload Artwork (Cloud with Up Arrow) */
export function UploadArtworkIcon({ className }: IconProps) {
  return (
    <AssetIcon
      className={className}
      src="/assets/wizard-icons/upload-artwork.svg"
    />
  );
}

/** Step 2 – AI Synthesis (Magic Wand / Sparkles) */
export function AISynthesisIcon({ className }: IconProps) {
  return (
    <AssetIcon
      className={className}
      src="/assets/wizard-icons/ai-synthesis.svg"
    />
  );
}

/** Step 3 – Final Review (Eye with search detail) */
export function FinalReviewIcon({ className }: IconProps) {
  return (
    <AssetIcon
      className={className}
      src="/assets/wizard-icons/final-review.svg"
    />
  );
}

/** Step 4 – Fabric Style (T-shirt / Textile Outline) */
export function FabricStyleIcon({ className }: IconProps) {
  return (
    <AssetIcon
      className={className}
      src="/assets/wizard-icons/fabric-style.svg"
    />
  );
}

/** Step 5 – Sizing & Fit (Focus Frame with center dot) */
export function SizingFitIcon({ className }: IconProps) {
  return (
    <AssetIcon
      className={className}
      src="/assets/wizard-icons/sizing-fit.svg"
    />
  );
}
