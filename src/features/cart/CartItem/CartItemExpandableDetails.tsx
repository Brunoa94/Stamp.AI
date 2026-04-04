import { ChevronDown } from "lucide-react";
import { cartTheme } from "@/theme/components";
import clsx from "clsx";

interface Props {
  unitPrice: number;
  variantName?: string;
  productName?: string;
}

export function CartItemExpandableDetails({
  unitPrice,
  variantName,
  productName,
}: Props) {
  return (
    <details className={cartTheme.item.expandSection}>
      <summary className={cartTheme.item.expandSummary}>
        <span className={cartTheme.item.expandLabel}>VIEW DETAILS</span>
        <ChevronDown
          className={clsx("w-3 h-3", cartTheme.item.expandIcon)}
          aria-hidden="true"
        />
      </summary>
      <div className={cartTheme.item.expandBody}>
        <div className={cartTheme.item.expandRow}>
          <span className={cartTheme.item.expandKey}>Unit Price</span>
          <span className={cartTheme.item.expandVal}>
            ${unitPrice.toFixed(2)}
          </span>
        </div>
        {variantName && (
          <div className={cartTheme.item.expandRow}>
            <span className={cartTheme.item.expandKey}>Variant</span>
            <span className={cartTheme.item.expandVal}>{variantName}</span>
          </div>
        )}
        {productName && (
          <div className={cartTheme.item.expandRow}>
            <span className={cartTheme.item.expandKey}>Product</span>
            <span className={cartTheme.item.expandVal}>{productName}</span>
          </div>
        )}
      </div>
    </details>
  );
}
