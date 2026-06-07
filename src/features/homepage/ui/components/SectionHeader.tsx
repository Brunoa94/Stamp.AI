"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import clsx from "clsx";

interface SectionHeaderProps {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  layout?: "stack" | "split";
  titleSize?: "md" | "lg" | "xl";
  showAccentBar?: boolean;
  accentBarClassName?: string;
  className?: string;
  descriptionClassName?: string;
}

export function SectionHeader({
  title,
  align = "center",
  titleSize = "lg",
  className,
}: SectionHeaderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsInView(true);
        observer.disconnect();
      },
      {
        threshold: 0.2,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={clsx(
        "section-header-enter relative",
        isInView && "section-header-enter--active",
        {
          "items-center text-center": align === "center",
          "items-start text-left": align === "left",
        },
        className,
      )}
    >
      <div
        className={clsx(
          "section-header-title-enter relative max-w-5xl",
          align === "center" && "mx-auto",
        )}
      >
        <h2
          className={clsx(
            "font-heading uppercase tracking-tight text-slate-900 drop-shadow-[0_8px_30px_rgba(124,58,237,0.14)]",
            {
              "text-2xl md:text-3xl": titleSize === "md",
              "text-3xl md:text-4xl": titleSize === "lg",
              "text-6xl leading-[0.85] md:text-7xl": titleSize === "xl",
            },
          )}
        >
          <span className="bg-linear-to-r from-slate-900 via-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">
            {title}
          </span>
        </h2>
        <div className="mx-auto mt-5 h-1 w-28 rounded-full bg-linear-to-r from-[#7C3AED] via-[#FF8C42] to-[#06B6D4]" />
      </div>
    </div>
  );
}
