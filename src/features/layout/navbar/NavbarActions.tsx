"use client";

import { useIsAuthenticated } from "@/hooks/useAuth";
import { AuthenticatedUserSection } from "./AuthenticatedUserSection";
import { UnauthenticatedUserSection } from "./UnauthenticatedUserSection";
import { ThemeToggle } from "@/features/ui/theme-toggle";
import { useCartSummary } from "@/queries/cartQueries";

import { Button } from "@/features/ui/button";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

export function NavbarActions() {
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const router = useRouter();
  const { itemCount } = useCartSummary();

  if (isLoading) {
    return (
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <div className="animate-pulse text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <ThemeToggle />
      {isAuthenticated ? (
        <>
          <Button
            variant="ghost"
            onClick={() => router.push("/cart")}
            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium relative"
          >
            <ShoppingCart className="w-4 h-4" />
            Cart
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-linear-to-r from-purple-600 via-pink-600 to-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push("/orders")}
            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium"
          >
            <ShoppingBag className="w-4 h-4" />
            My Orders
          </Button>
          <AuthenticatedUserSection />
        </>
      ) : (
        <UnauthenticatedUserSection />
      )}
    </div>
  );
}
