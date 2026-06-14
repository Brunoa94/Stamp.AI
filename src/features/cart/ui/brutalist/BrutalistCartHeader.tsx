/**
 * Brutalist Cart Header Component
 *
 * Displays the cart page header with:
 * - Purple accent bar
 * - Large Anton typography for "Shopping Cart" (with purple accent on "Cart")
 * - Item count subtitle in uppercase with wide tracking
 */

import { Heading } from '@/features/ui/heading';
import { Span } from '@/features/ui/span';

interface BrutalistCartHeaderPropsI {
  itemCount: number;
}

export function BrutalistCartHeader({ itemCount }: BrutalistCartHeaderPropsI) {
  const itemText = itemCount === 1 ? 'Item' : 'Items';

  return (
    <div className="lg:col-span-12 space-y-4">
      {/* Purple accent bar */}
      <div className="h-1.5 w-20 bg-brandPurple" />

      {/* Main heading */}
      <Heading as="h1" variant="title">
        Shopping <span className="text-brandPurple">Cart</span>
      </Heading>

      {/* Item count subtitle */}
      <Span variant="default" className="opacity-40 tracking-[0.5em]">
        {itemCount} {itemText} ready for production protocol
      </Span>
    </div>
  );
}
