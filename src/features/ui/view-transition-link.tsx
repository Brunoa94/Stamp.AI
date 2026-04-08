"use client";

import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import { type ComponentProps, useCallback } from "react";

type ViewTransitionLinkProps = LinkProps &
  Omit<ComponentProps<"a">, keyof LinkProps> & {
    /** Custom view transition name for this navigation */
    viewTransitionName?: string;
  };

/**
 * A Link component wrapper (view transitions disabled).
 */
export function ViewTransitionLink({
  children,
  href,
  viewTransitionName,
  style,
  ...props
}: ViewTransitionLinkProps) {
  return (
    <Link href={href} style={style} {...props}>
      {children}
    </Link>
  );
}

/**
 * Hook to programmatically navigate (view transitions disabled).
 */
export function useViewTransitionNavigate() {
  const router = useRouter();

  return useCallback(
    (href: string, options?: { replace?: boolean }) => {
      if (options?.replace) {
        router.replace(href);
      } else {
        router.push(href);
      }
    },
    [router]
  );
}
