/**
 * Animated Logo Dot Component
 *
 * Rotating conic gradient dot for the STAMP.AI logo
 */

import { Span } from "@/features/ui/span";

interface AnimatedLogoDotProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AnimatedLogoDot({
  size = "md",
  className = "",
}: AnimatedLogoDotProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "!w-4 !h-4",
    lg: "!w-6 !h-6",
  };

  return (
    <Span
      unstyled
      className={`animated-dot ${sizeClasses[size]} ${className}`}
      aria-hidden="true"
    />
  );
}
