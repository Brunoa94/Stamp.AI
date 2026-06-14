/**
 * Brutalist Empty Cart Component
 *
 * Displays empty cart state with:
 * - Centered brutalist layout
 * - Large Anton heading
 * - "Continue Browsing Terminal" link with arrow icon
 */

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/features/ui/button';
import { Heading } from '@/features/ui/heading';
import { Span } from '@/features/ui/span';

export function BrutalistEmptyCart() {
  return (
    <div className="lg:col-span-12 flex flex-col items-center justify-center py-20 lg:py-32">
      {/* Purple accent bar */}
      <div className="h-1.5 w-20 bg-brandPurple mb-8" />

      {/* Empty cart heading */}
      <Heading as="h1" variant="title" className="text-center mb-6">
        Your Cart is <span className="text-brandPurple">Empty</span>
      </Heading>

      {/* Subtitle */}
      <Span variant="default" className="opacity-40 mb-12 text-center tracking-[0.4em]">
        No items in production protocol
      </Span>

      {/* Continue browsing link */}
      <Button asChild variant="brutalist-ghost" className="gap-3">
        <Link href="/create">
          <ArrowLeft className="w-4 h-4" />
          <Span variant="default" className="tracking-[0.4em]">Start Creating Terminal</Span>
        </Link>
      </Button>
    </div>
  );
}
