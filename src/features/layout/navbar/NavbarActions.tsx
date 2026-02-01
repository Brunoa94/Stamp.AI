"use client";

import { useIsAuthenticated, useUser } from "@/hooks/useAuth";
import { AuthenticatedUserSection } from "./AuthenticatedUserSection";
import { UnauthenticatedUserSection } from "./UnauthenticatedUserSection";
import { ThemeToggle } from "@/features/ui/theme-toggle";

import { Button } from "@/features/ui/button";
import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

export function NavbarActions() {
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const { data: user } = useUser();
  const router = useRouter();

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
      {isAuthenticated && user ? (
        <>
          <Button 
            variant="ghost" 
            onClick={() => router.push("/orders")}
            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium"
          >
            <ShoppingBag className="w-4 h-4" />
            My Orders
          </Button>
          <AuthenticatedUserSection user={user} />
        </>
      ) : (
        <UnauthenticatedUserSection />
      )}
    </div>
  );
}
