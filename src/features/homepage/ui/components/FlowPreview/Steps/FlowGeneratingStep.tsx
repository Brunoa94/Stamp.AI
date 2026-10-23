import type { LucideIcon } from "lucide-react";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import type { FlowGeneratingToneType } from "@/features/homepage/lib/types/flowPreview";

const toneClasses: Record<
  FlowGeneratingToneType,
  { root: string; title: string; eta: string; icon: string; track: string }
> = {
  dark: {
    root: "bg-(--color-stamp-chocolate)",
    title: "text-(--color-stamp-cream)",
    eta: "text-(--color-stamp-cream)/60",
    icon: "text-(--color-stamp-cream)/80",
    track: "bg-(--color-stamp-cream)/15",
  },
  light: {
    root: "bg-(--color-stamp-cream)",
    title: "text-(--color-stamp-chocolate)",
    eta: "text-(--color-stamp-taupe)",
    icon: "text-(--color-stamp-taupe)",
    track: "bg-(--color-stamp-chocolate)/10",
  },
};

interface PropsI {
  tone: FlowGeneratingToneType;
  icon: LucideIcon;
  title: string;
  eta: string;
  progressPct: number;
}

/**
 * FlowGeneratingStep
 *
 * Full-window loading screen with a spinning ring and a progress bar.
 * Used for step 03 (dark, generating the design) and step 07 (light, mockups).
 */
export function FlowGeneratingStep({ tone, icon: Icon, title, eta, progressPct }: PropsI) {
  const classes = toneClasses[tone];

  return (
    <div
      className={cn(
        "animate-flow-fade absolute inset-0 flex flex-col items-center justify-center gap-4.5 px-6 text-center",
        classes.root,
      )}
    >
      <div className="relative size-18">
        {/* eslint-disable-next-line no-restricted-syntax -- ring stroke follows the tone via currentColor and theme tokens */}
        <svg viewBox="0 0 72 72" className="absolute inset-0 animate-spin [animation-duration:1.4s]">
          <circle cx="36" cy="36" r="33" fill="none" strokeWidth="2" className={cn("stroke-current", classes.icon)} opacity=".25" />
          <path
            d="M36 3 A33 33 0 0 1 69 36"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            className="stroke-(--color-stamp-gold)"
          />
        </svg>
        <Icon className={cn("absolute inset-0 m-auto size-6.5", classes.icon)} strokeWidth={1.6} />
      </div>
      <Heading as="div" variant="cardCompact" className={cn("text-2xl uppercase tracking-wide", classes.title)}>
        {title}
      </Heading>
      <Span unstyled className={cn("text-2xs uppercase tracking-widest", classes.eta)}>
        {eta}
      </Span>
      <div className={cn("h-0.5 w-50", classes.track)}>
        <div className="h-full bg-(--color-stamp-gold)" style={{ width: `${progressPct}%` }} />
      </div>
    </div>
  );
}
