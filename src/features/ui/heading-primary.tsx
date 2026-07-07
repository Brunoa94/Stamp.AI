import { cn } from "@/lib/utils";
import { Heading, HeadingVariant } from "./heading";

/**
 * HeadingPrimary
 *
 * Primary section/page title molecule. Renders the accent gradient bar and a
 * two-part title: the main title set in Anton (via Heading) and the
 * highlighted word set in the secondary heading font (Bebas Neue via
 * `font-heading`) in the accent color.
 *
 * This is the single component to use for section titles across features.
 */

type AccentColorType = "brandPurple" | "brandCyan" | "brandOrange";
type HeadingPrimaryTag = "h1" | "h2" | "h3";

const gradientMap: Record<AccentColorType, string> = {
  brandPurple: "from-brandPurple",
  brandCyan: "from-brandCyan",
  brandOrange: "from-brandOrange",
};

const textMap: Record<AccentColorType, string> = {
  brandPurple: "text-brandPurple",
  brandCyan: "text-brandCyan",
  brandOrange: "text-brandOrange",
};

interface PropsI {
  as?: HeadingPrimaryTag;
  variant?: Extract<HeadingVariant, "section" | "title">;
  title: string;
  highlightedWord: string;
  stepNumber?: string;
  accentColor?: AccentColorType;
  className?: string;
}

export function HeadingPrimary({
  as = "h2",
  variant = "section",
  title,
  highlightedWord,
  stepNumber,
  accentColor = "brandPurple",
  className,
}: PropsI) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row justify-between items-start md:items-baseline gap-4",
        className,
      )}
    >
      <div
        className={cn(
          "h-1.5 w-20 bg-linear-to-r to-transparent mb-6 md:mb-0",
          gradientMap[accentColor],
        )}
      />

      <Heading
        as={as}
        variant={variant}
        className="flex-1 text-center md:text-left"
      >
        {stepNumber ? `${stepNumber} / ` : ""}
        {title}{" "}
        <span
          className={cn("font-heading tracking-tight", textMap[accentColor])}
        >
          {highlightedWord}
        </span>
      </Heading>
    </div>
  );
}
