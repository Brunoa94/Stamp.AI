import Image from "next/image";

interface ProductImageProps {
  src: string;
  alt: string;
}

export function ProductImage({ src, alt }: ProductImageProps) {
  return (
    <div className="w-full aspect-square bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border-2 border-gray-200 dark:border-gray-700 p-4">
      <Image
        src={src}
        alt={alt}
        width={800}
        height={800}
        className="w-full h-full object-contain"
      />
    </div>
  );
}
