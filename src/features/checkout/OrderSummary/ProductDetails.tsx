import { CartItem } from "@/types/cart";
import { formatDateShort } from "@/utils/dateUtils";
import Image from "next/image";

interface Props {
  product: CartItem;
}

export const ProductDetails = ({ product }: Props) => {
  console.log("PRODUCT: ", product);
  return (
    <article className="flex items-start gap-4 mb-6 pb-6 border-b border-slate-100">
      {product.custom_image_url && (
        <figure className="relative w-24 h-24 glass-card border border-white/40 p-2">
          <Image
            src={product.custom_image_url}
            alt="Product design preview"
            fill
            className="object-contain mix-blend-multiply"
          />
        </figure>
      )}
      <div className="flex-1">
        <p className="text-sm font-bold uppercase tracking-tight text-slate-900">
          {product.product_name || product.product?.name}
        </p>
        {product.created_at && (
          <p className="text-xs text-slate-500">
            Added {formatDateShort(product.created_at)}
          </p>
        )}
        <p className="text-xs text-slate-500">Quantity: {product.quantity}</p>
      </div>
      <p className="text-sm font-bold text-purple-600">
        ${product.unit_price * product.quantity}
      </p>
    </article>
  );
};
