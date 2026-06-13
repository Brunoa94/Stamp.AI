"use client";

import { Heading } from "@/features/ui/heading";

interface SectionHeaderProps {
  stepNumber: string;
  title: string;
  highlightedWord: string;
  accentColor: "brandPurple" | "brandCyan" | "brandOrange";
}

export function SectionHeader({
  stepNumber,
  title,
  highlightedWord,
  accentColor,
}: SectionHeaderProps) {
  const gradientMap = {
    brandPurple: "from-brandPurple",
    brandCyan: "from-brandCyan",
    brandOrange: "from-brandOrange",
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-baseline mb-12 gap-4">
      <div
        className={`h-1.5 w-20 bg-linear-to-r ${gradientMap[accentColor]} to-transparent mb-6 md:mb-0`}
      />

      <Heading variant="section" className="flex-1 text-center md:text-left">
        {stepNumber} / {title}{" "}
        <span className={`text-${accentColor}`}>{highlightedWord}</span>
      </Heading>
    </div>
  );
}
