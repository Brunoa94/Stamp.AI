import { ProductCustomizationT } from "@/schemas/checkout";
import { componentThemes } from "@/theme/components";
import Image from "next/image";

interface ProductDetailsProps {
  customization: ProductCustomizationT;
  subtotal: number;
}

export const ProductDetails = ({ customization, subtotal }: ProductDetailsProps) => {
  return (
    <article className="flex items-start gap-4 mb-6 pb-6 border-b border-purple-100">
      {customization.preview_url && (
        <figure className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-purple-200">
          <Image
            src={customization.preview_url}
            alt="Product design preview"
            fill
            className="object-contain"
          />
        </figure>
      )}
      <div className="flex-1">
        <p className="font-semibold text-gray-900">{customization.product_title}</p>
        <p className={componentThemes.text.caption}>{customization.variant_title}</p>
        <p className={componentThemes.text.caption}>Qty: {customization.quantity}</p>
      </div>
      <p className="font-semibold text-gray-900">${subtotal.toFixed(2)}</p>
    </article>
  );
};
