import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";

interface PropsI {
  tagline: string;
  /** Optional accent word to highlight in tagline with serif style */
  accentWord?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  /** Text alignment */
  align?: "left" | "center" | "right";
  /** Section number for luxury styling (e.g., "01") */
  sectionNumber?: string;
  /** Inverted colors for dark backgrounds */
  inverted?: boolean;
}

export function PromoSectionContent({
  tagline,
  accentWord,
  description,
  ctaText,
  ctaHref = "/stamp",
  align = "center",
  sectionNumber,
  inverted = false,
}: PropsI) {
  const renderTagline = () => {
    if (!accentWord || !tagline.includes(accentWord)) {
      return tagline;
    }

    const parts = tagline.split(accentWord);
    return (
      <>
        {parts[0]}
        <Span
          variant="serif"
          className={
            inverted
              ? "text-(--color-stamp-gold)"
              : "text-(--color-stamp-taupe)"
          }
        >
          {accentWord}
        </Span>
        {parts[1]}
      </>
    );
  };

  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  return (
    <div className={cn("flex flex-col gap-5", alignmentClasses[align])}>
      {/* Luxury section label with number */}
      {sectionNumber && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold tracking-[0.3em] text-(--color-stamp-gold) uppercase">
            {sectionNumber}
          </span>
          <div className="w-8 h-px bg-(--color-stamp-gold)/60" />
        </div>
      )}

      {/* Main tagline with larger, bolder typography */}
      <Heading
        as="h2"
        variant="section"
        className={cn(
          "max-w-lg",
          inverted
            ? "text-(--color-stamp-off-white)"
            : "text-(--color-stamp-chocolate)",
        )}
      >
        {renderTagline()}
      </Heading>

      {/* Description with refined spacing */}
      {description && (
        <Paragraph
          variant="sm"
          className={cn(
            "max-w-md leading-relaxed",
            inverted
              ? "text-(--color-stamp-taupe)"
              : "text-(--color-stamp-chocolate)/70",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </Paragraph>
      )}
    </div>
  );
}
