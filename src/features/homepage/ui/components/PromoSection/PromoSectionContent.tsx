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
}

export function PromoSectionContent({
  tagline,
  accentWord,
  description,
  ctaText,
  ctaHref = "/stamp",
  align = "center",
  sectionNumber,
}: PropsI) {
  const renderTagline = () => {
    if (!accentWord || !tagline.includes(accentWord)) {
      return tagline;
    }

    const parts = tagline.split(accentWord);
    return (
      <>
        {parts[0]}
        <Span variant="serif" className="text-(--color-stamp-taupe)">
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
        className="text-(--color-stamp-chocolate) max-w-lg"
      >
        {renderTagline()}
      </Heading>

      {/* Description with refined spacing */}
      {description && (
        <Paragraph
          variant="sm"
          className={cn(
            "max-w-md text-(--color-stamp-chocolate)/70 leading-relaxed",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </Paragraph>
      )}

      {/* Luxury CTA button */}
      {ctaText && (
        <Link
          href={ctaHref}
          className={cn(
            "group inline-flex items-center gap-3 mt-2",
            "px-6 py-3 rounded-full",
            "bg-(--color-stamp-chocolate) text-(--color-stamp-white)",
            "font-semibold text-sm uppercase tracking-wider",
            "transition-all duration-300",
            "hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate)",
            "shadow-md hover:shadow-lg",
          )}
        >
          <span>{ctaText}</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
