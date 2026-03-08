"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { cartTheme } from "@/theme/components";
import { Button } from "@/features/ui/button";

export function EmptyCart() {
  return (
    <div className={cartTheme.empty.container}>
      <div className={cartTheme.empty.iconWrap}>
        <ShoppingBag className="w-12 h-12 text-slate-600" />
      </div>

      <h2 className={cartTheme.empty.title}>Your cart is empty</h2>

      <p className={cartTheme.empty.description}>
        Looks like you haven't added anything to your cart yet. Start shopping
        to find amazing products!
      </p>

      <Button asChild className={cartTheme.empty.action}>
        <Link href="/stamp">Start Designing</Link>
      </Button>
    </div>
  );
}
