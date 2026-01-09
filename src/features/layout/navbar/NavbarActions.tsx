"use client";

import { useIsAuthenticated, useUser } from "@/hooks/useAuth";
import { AuthenticatedUserSection } from "./AuthenticatedUserSection";
import { UnauthenticatedUserSection } from "./UnauthenticatedUserSection";

export function NavbarActions() {
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const { data: user } = useUser();

  if (isLoading) {
    return <div className="animate-pulse text-sm">Loading...</div>;
  }

  if (isAuthenticated && user) {
    return <AuthenticatedUserSection user={user} />;
  }

  return <UnauthenticatedUserSection />;
}
