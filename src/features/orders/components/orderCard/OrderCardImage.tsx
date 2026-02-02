import Image from "next/image";

interface OrderCardImageProps {
  imageUrl: string | undefined;
  productName: string;
}

export function OrderCardImage({ imageUrl, productName }: OrderCardImageProps) {
  if (!imageUrl) return null;

  return (
    <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-purple-200 dark:border-purple-600 shrink-0">
      <Image
        src={imageUrl}
        alt={productName}
        fill
        className="object-cover"
        sizes="80px"
      />
    </div>
  );
}
