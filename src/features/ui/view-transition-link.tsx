"use client";

import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { type ComponentProps, type MouseEvent, useCallback } from "react";

type ViewTransitionLinkProps = LinkProps &
  Omit<ComponentProps<"a">, keyof LinkProps> & {
    /** Custom view transition name for this navigation */
    viewTransitionName?: string;
  };

/**
 * A Link component that triggers View Transitions API for smooth page navigation.
 *
 * Usage:
 * ```tsx
 * <ViewTransitionLink href="/products">Products</ViewTransitionLink>
 *
 * // With custom transition name for shared element transitions:
 * <ViewTransitionLink href="/product/123" viewTransitionName="product-card">
 *   <ProductCard />
 * </ViewTransitionLink>
 * ```
 */
export function ViewTransitionLink({
  children,
  href,
  onClick,
  viewTransitionName,
  style,
  ...props
}: ViewTransitionLinkProps) {
  const router = useRouter();

  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      // Call the original onClick if provided
      onClick?.(e);

      // If default was prevented, don't handle navigation
      if (e.defaultPrevented) return;

      // Skip for modified clicks (new tab, etc.)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      // Check if View Transitions API is supported
      if (!document.startViewTransition) return;

      // Prevent default navigation
      e.preventDefault();

      // Start the view transition
      document.startViewTransition(() => {
        router.push(href.toString());
      });
    },
    [href, onClick, router]
  );

  const linkStyle = viewTransitionName
    ? { ...style, viewTransitionName }
    : style;

  return (
    <Link href={href} onClick={handleClick} style={linkStyle} {...props}>
      {children}
    </Link>
  );
}

/**
 * Hook to programmatically navigate with view transitions.
 *
 * Usage:
 * ```tsx
 * const navigateWithTransition = useViewTransitionNavigate();
 *
 * const handleClick = () => {
 *   navigateWithTransition('/dashboard');
 * };
 * ```
 */
export function useViewTransitionNavigate() {
  const router = useRouter();

  return useCallback(
    (href: string, options?: { replace?: boolean }) => {
      if (!document.startViewTransition) {
        if (options?.replace) {
          router.replace(href);
        } else {
          router.push(href);
        }
        return;
      }

      document.startViewTransition(() => {
        if (options?.replace) {
          router.replace(href);
        } else {
          router.push(href);
        }
      });
    },
    [router]
  );
}
