import { CreatedProduct } from "@/services/customProductService";
import { Button } from "@/features/ui/button";
import { theme, CreditCardIcon, ArrowRightIcon } from "@/theme";
import { StatusHeader } from "@/features/ui/status-header";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";

interface Props {
  product: CreatedProduct;
  generatedImageUrl?: string;
  orderId?: string;
}

const CreatedProductDisplay = ({ product, generatedImageUrl, orderId }: Props) => {
  const displayImage = product.images?.[0]?.src || generatedImageUrl;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <StatusHeader
        title="Product Created Successfully"
        variant="info"
      />

      {/* Product Image */}
      {displayImage && (
        <div className="bg-linear-to-br from-purple-50/50 via-pink-50/50 to-blue-50/50 dark:from-gray-800/80 dark:via-purple-800/30 dark:to-pink-800/30 backdrop-blur-sm border border-purple-100 dark:border-purple-800/30 rounded-2xl overflow-hidden shadow-lg shadow-purple-500/20 dark:shadow-purple-500/10">
          <Image
            src={displayImage}
            alt={product.title}
            width={800}
            height={800}
            className="w-full h-auto object-contain"
          />
        </div>
      )}

      {/* Go to Payment Button */}
      <div className="flex justify-center mt-6">
        <Button
          asChild
          className={clsx(theme.button.submit.base, theme.button.submit.enabled, "px-8")}
        >
          <Link href={orderId ? `/checkout?orderId=${orderId}` : "/checkout"}>
            <CreditCardIcon className="w-5 h-5 text-yellow-300" />
            Go to Payment
            <ArrowRightIcon className="w-5 h-5 text-green-300" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default CreatedProductDisplay;
