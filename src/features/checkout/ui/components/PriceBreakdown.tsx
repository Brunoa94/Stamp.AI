import { PriceRow } from "./PriceRow";

interface PriceBreakdownProps {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

/**
 * PriceBreakdown - Displays complete price breakdown
 * Extracted from OrderSummarySection using PriceRow atoms
 */
export function PriceBreakdown({
  subtotal,
  shipping,
  discount,
  total,
}: PriceBreakdownProps) {
  return (
    <div className="space-y-4">
      <PriceRow label="Subtotal" value={subtotal} variant="normal" />

      <PriceRow
        label="Shipping"
        value={shipping === 0 ? "Free" : shipping}
        variant={shipping === 0 ? "discount" : "normal"}
      />

      {discount > 0 && (
        <PriceRow label="Discount" value={-discount} variant="discount" />
      )}

      <div className="h-px bg-slate-100 my-2" />

      <PriceRow label="Total" value={total} variant="total" />
    </div>
  );
}
