/**
 * DashboardHeader
 *
 * Luxury page header: gold accent bar, Anton title with a serif-italic
 * accent word, and a personalized taupe subtitle.
 */

import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import type { UserI } from "@/types/auth";
import { getDisplayName } from "../../lib/helpers/userPresentation";

interface DashboardHeaderPropsI {
  user?: UserI | null;
}

export function DashboardHeader({ user }: DashboardHeaderPropsI) {
  return (
    <header className="space-y-4">
      <div className="h-1.5 w-20 bg-(--color-stamp-gold)" />
      <Heading
        as="h1"
        variant="title"
        className="text-(--color-stamp-chocolate)"
      >
        Your{" "}
        <Span variant="serif" className="text-(--color-stamp-taupe)">
          atelier
        </Span>
      </Heading>
      <Span variant="default" className="text-(--color-stamp-taupe)">
        Welcome back, {getDisplayName(user)} — your production overview
      </Span>
    </header>
  );
}
