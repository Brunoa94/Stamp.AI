import Image from "next/image";
import { cartTheme } from "@/theme/components";

interface Props {
  imageUrl?: string | null;
  productName?: string;
}

export function CartItemImage({ imageUrl, productName }: Props) {
  return (
    <div className={cartTheme.item.imageWrap}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={productName || "Product"}
          width={128}
          height={128}
          className={cartTheme.item.image}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
          No image
        </div>
      )}
    </div>
  );
}
