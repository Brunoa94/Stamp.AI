interface ProductDetailsSummaryPropsI {
  productTitle: string;
  priceLabel: string;
  variantTitle?: string;
}

export function ProductDetailsSummary({
  productTitle,
  priceLabel,
  variantTitle,
}: ProductDetailsSummaryPropsI) {
  return (
    <div className="max-w-2xl mx-auto bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Product
          </span>
          <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {productTitle}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Price
          </span>
          <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {priceLabel}
          </span>
        </div>

        {variantTitle && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Variant
            </span>
            <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {variantTitle}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
