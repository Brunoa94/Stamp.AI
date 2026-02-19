import { componentThemes } from "@/theme/components";
import { CartItem } from "@/types/cart";
import { formatDateShort } from "@/utils/dateUtils";
import Image from "next/image";

interface Props {
  product: CartItem;
}

export const ProductDetails = ({ product }: Props) => {
  console.log("PRODUCT: ", product);
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
        <p className="font-semibold text-gray-900">{product.product_name || product.product?.name}</p>
        {product.created_at && (
          <p className={componentThemes.text.caption}>
            Added {formatDateShort(product.created_at)}
          </p>
        )}
        <p className={componentThemes.text.caption}>
          Quantity: {product.quantity}
        </p>
      </div>
      <p className="font-semibold text-gray-900">
        ${product.unit_price * product.quantity}
      </p>
    </article>
  );
};
