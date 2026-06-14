/**
 * Cart Layout Component
 *
 * Provides the main layout structure for the cart page:
 * - Min-height screen with flex column
 * - Concrete background
 * - 12-column responsive grid (8-col items, 4-col summary)
 * - Proper spacing and max-width container
 */

import { ReactNode } from 'react';

interface CartLayoutPropsI {
  children: ReactNode;
}

export function CartLayout({ children }: CartLayoutPropsI) {
  return (
    <div className="min-h-screen flex flex-col relative z-10">
      <main className="flex-1 px-6 lg:px-24 py-12 lg:py-20 max-w-[1600px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {children}
        </div>
      </main>
    </div>
  );
}
