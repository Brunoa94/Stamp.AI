"use client";

import * as React from "react";
import type { ViewTransitionProps } from "react";

/**
 * ViewTransition
 *
 * React's <ViewTransition> as shipped by Next's bundled React canary.
 * The stable `react` package (used by Vitest) does not export it yet, so
 * there it falls back to rendering the children without animating —
 * the same thing browsers without the View Transitions API see.
 *
 * Animations only run for updates inside a Transition (startTransition,
 * useDeferredValue, Suspense reveals, router navigation).
 */
export const ViewTransition: React.ComponentType<ViewTransitionProps> =
  React.ViewTransition ?? (({ children }: ViewTransitionProps) => children);
