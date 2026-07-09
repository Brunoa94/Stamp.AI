/**
 * CartItemCardImage
 *
 * Product image plate for a cart line item, on a cream surface with a
 * shopping-bag fallback when no custom image is present.
 */

import Image from "next/image";
import { ShoppingBag } from "lucide-react";

interface CartItemCardImagePropsI {
  imageUrl: string | null | undefined;
  productName: string;
}

export function CartItemCardImage({
  imageUrl,
  productName,
}: CartItemCardImagePropsI) {
  return (
    <div className="relative aspect-square w-full overflow-hidden border border-(--color-stamp-divider) bg-(--color-stamp-cream) md:w-40">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={productName}
          width={160}
          height={160}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <ShoppingBag
            className="h-8 w-8 text-(--color-stamp-taupe)/40"
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}
