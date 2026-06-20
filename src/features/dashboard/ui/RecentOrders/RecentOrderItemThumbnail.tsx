import Image from "next/image";
import { Shirt } from "lucide-react";

interface PropsI {
  imageUrl?: string | null;
  productName: string;
}

export function RecentOrderItemThumbnail({ imageUrl, productName }: PropsI) {
  return (
    <div className="w-12 h-12 bg-concrete border border-ink/5 flex items-center justify-center relative">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={productName}
          width={32}
          height={32}
          className="object-contain"
        />
      ) : (
        <Shirt className="w-6 h-6 text-ink/20" />
      )}
    </div>
  );
}
