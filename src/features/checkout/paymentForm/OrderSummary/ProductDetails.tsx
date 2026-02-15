import { ProductCustomizationT } from "@/schemas/checkout";
import { componentThemes } from "@/theme/components";
import { CartItemWithProduct } from "@/types/cart";
import Image from "next/image";

interface Props {
  product: CartItemWithProduct;
}

export const ProductDetails = ({ product }: Props) => {
  return (
    <article className="flex items-start gap-4 mb-6 pb-6 border-b border-purple-100">
      {product.custom_image_url && (
        <figure className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-purple-200">
          <Image
            src={product.custom_image_url}
            alt="Product design preview"
            fill
            className="object-contain"
          />
        </figure>
      )}
      <div className="flex-1">
        <p className="font-semibold text-gray-900">{product.product?.name}</p>
        <p className={componentThemes.text.caption}>{product.created_at}</p>
        <p className={componentThemes.text.caption}>Qty: {product.quantity}</p>
      </div>
      <p className="font-semibold text-gray-900">${product.quantity}</p>
    </article>
  );
};
