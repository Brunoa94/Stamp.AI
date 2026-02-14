interface BrandModelProps {
  brand: string;
  model: string;
}

export function BrandModel({ brand, model }: BrandModelProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      <span className="font-medium">{brand}</span>
      <span>•</span>
      <span>{model}</span>
    </div>
  );
}
