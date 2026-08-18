"use client";

/**
 * PencilUnderline
 *
 * Animated SVG pencil underline that draws itself when visible.
 * Used below the "ai" text in the hero title.
 */

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PencilUnderlineProps {
  className?: string;
  delay?: number;
}

export function PencilUnderline({ className, delay = 800 }: PencilUnderlineProps) {
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDrawing(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <svg
      viewBox="0 0 120 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("absolute -bottom-1 left-0 w-full h-[0.4em]", className)}
      preserveAspectRatio="none"
    >
      {/* Main swooping underline */}
      <path
        d="M3 20 C15 8, 35 35, 60 18 C85 2, 105 30, 117 15"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          "transition-all duration-1000 ease-out",
          isDrawing ? "pencil-underline--drawn" : "pencil-underline--hidden"
        )}
        style={{
          strokeDasharray: 180,
          strokeDashoffset: isDrawing ? 0 : 180,
        }}
      />
      {/* Second wavy line for hand-drawn effect */}
      <path
        d="M8 28 C22 15, 42 40, 65 25 C88 10, 108 35, 115 22"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
        className={cn(
          "transition-all duration-1000 ease-out",
          isDrawing ? "pencil-underline--drawn" : "pencil-underline--hidden"
        )}
        style={{
          strokeDasharray: 180,
          strokeDashoffset: isDrawing ? 0 : 180,
          transitionDelay: "200ms",
        }}
      />
    </svg>
  );
}
