"use client";

import { useIsAuthenticated, useUser } from "@/hooks/useAuth";
import { AuthenticatedUserSection } from "./AuthenticatedUserSection";
import { UnauthenticatedUserSection } from "./UnauthenticatedUserSection";
import { ThemeToggle } from "@/features/ui/theme-toggle";

export function NavbarActions() {
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const { data: user } = useUser();

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
        <AuthenticatedUserSection user={user} />
      ) : (
        <UnauthenticatedUserSection />
      )}
    </div>
  );
}
