import { PropertyCard } from "@/features/ui/property-card";

interface MaterialFitProps {
  material: string;
  fit: string;
}

export function MaterialFit({ material, fit }: MaterialFitProps) {
  return (
    <div className="flex gap-4">
      <PropertyCard label="Material" value={material} variant="purple" />
      <PropertyCard label="Fit" value={fit} variant="pink" />
    </div>
  );
}
