/**
 * Brutalist Cart Item Card Component
 *
 * Displays individual cart item with:
 * - White card with hard borders (no rounded corners)
 * - Grayscale product image with mix-blend-multiply
 * - Product name, price, and specifications
 * - Quantity controls with bordered buttons
 * - Remove button with trash icon
 */

'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/features/ui/button';
import { Heading } from '@/features/ui/heading';
import { Span } from '@/features/ui/span';
import { CartItem } from '@/types/cart';

interface BrutalistCartItemCardPropsI {
  item: CartItem;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export function BrutalistCartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
}: BrutalistCartItemCardPropsI) {
  const handleIncrement = () => {
    if (item.quantity < 99) {
      onUpdateQuantity(item.id, item.quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleRemove = () => {
    onRemove(item.id);
  };

  // Extract product details
  const productName = item.product_name || item.product?.name || 'Custom Product';
  const imageUrl = item.custom_image_url;
  const price = item.unit_price;
  const variantName = item.variant?.name || 'Standard';

  // Parse variant for specs (if available)
  const fit = 'Boxy / Oversized'; // Default or from product metadata
  const textile = '500GSM Cotton'; // Default or from product metadata
  const colorway = variantName.includes('/') ? variantName.split('/')[0].trim() : 'Core Bone';

  return (
    <div className="cart-item-card bg-white border border-ink/10 p-8 lg:p-12">
      <div className="flex flex-col md:flex-row gap-10 items-start">
        {/* Product Image */}
        <div className="w-full md:w-40 aspect-square bg-concrete border border-ink/5 flex items-center justify-center relative overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={productName}
              width={160}
              height={160}
              className="w-full h-full object-cover grayscale mix-blend-multiply opacity-80"
            />
          ) : (
            <div className="text-xs uppercase tracking-widest opacity-30">No Image</div>
          )}
          <div className="absolute inset-0 border border-ink/5 pointer-events-none" />
        </div>

        {/* Product Details */}
        <div className="flex-1 w-full flex flex-col justify-between self-stretch">
          <div className="space-y-6">
            {/* Product name and price */}
            <div className="flex justify-between items-start">
              <div>
                <Heading as="h3" variant="card">
                  {productName}
                </Heading>
                <Span variant="default" className="opacity-30 mt-1 tracking-[0.3em]">
                  Custom Design Synthesis
                </Span>
              </div>
              <Heading as="span" variant="question">${(price / 100).toFixed(2)} each</Heading>
            </div>

            {/* Product specifications grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pb-8">
              <div className="space-y-1">
                <Span variant="micro" className="opacity-30">
                  Fit Protocol
                </Span>
                <Span variant="default" className="text-xs block">{fit}</Span>
              </div>
              <div className="space-y-1">
                <Span variant="micro" className="opacity-30">
                  Textile
                </Span>
                <Span variant="default" className="text-xs block">{textile}</Span>
              </div>
              <div className="space-y-1">
                <Span variant="micro" className="opacity-30">
                  Colorway
                </Span>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-white border border-ink/10" />
                  <Span variant="default" className="text-xs">{colorway}</Span>
                </div>
              </div>
            </div>
          </div>

          {/* Quantity controls and remove button */}
          <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center pt-8 border-t border-ink/5 mt-auto gap-6">
            {/* Quantity selector */}
            <div className="flex items-center border border-ink/10 bg-concrete/50">
              <Button
                onClick={handleDecrement}
                disabled={item.quantity <= 1}
                variant="ghost"
                className="w-10 h-10 rounded-none p-0 hover:bg-ink hover:text-white disabled:opacity-30"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Heading as="span" variant="item" className="w-12 text-center text-lg">
                {item.quantity}
              </Heading>
              <Button
                onClick={handleIncrement}
                disabled={item.quantity >= 99}
                variant="ghost"
                className="w-10 h-10 rounded-none p-0 hover:bg-ink hover:text-white disabled:opacity-30"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Remove button */}
            <Button
              onClick={handleRemove}
              variant="ghost"
              className="text-red-600 hover:underline hover:bg-transparent p-0 h-auto"
            >
              <Trash2 className="w-3 h-3 mr-2" />
              <Span variant="default" className="tracking-[0.3em]">Remove Protocol</Span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
