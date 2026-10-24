import type { LucideIcon } from "lucide-react";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import {
  flowGeneratingEtaVariants,
  flowGeneratingIconVariants,
  flowGeneratingRootVariants,
  flowGeneratingTitleVariants,
  flowGeneratingTrackVariants,
} from "@/features/homepage/lib/variants/flowGeneratingVariants";
import type { FlowGeneratingToneType } from "@/features/homepage/lib/types/flowPreview";

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
  return (
    <div
      className={flowGeneratingRootVariants({ tone })}
    >
      <div className="relative size-18">
        {/* eslint-disable-next-line no-restricted-syntax -- ring stroke follows the tone via currentColor and theme tokens */}
        <svg viewBox="0 0 72 72" className="absolute inset-0 animate-spin [animation-duration:1.4s]">
          <circle cx="36" cy="36" r="33" fill="none" strokeWidth="2" className={cn("stroke-current", flowGeneratingIconVariants({ tone }))} opacity=".25" />
          <path
            d="M36 3 A33 33 0 0 1 69 36"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            className="stroke-(--color-stamp-gold)"
          />
        </svg>
        <Icon className={cn("absolute inset-0 m-auto size-6.5", flowGeneratingIconVariants({ tone }))} strokeWidth={1.6} />
      </div>
      <Heading as="div" variant="cardCompact" className={flowGeneratingTitleVariants({ tone })}>
        {title}
      </Heading>
      <Span unstyled className={flowGeneratingEtaVariants({ tone })}>
        {eta}
      </Span>
      <div className={flowGeneratingTrackVariants({ tone })}>
        <div className="h-full bg-(--color-stamp-gold)" style={{ width: `${progressPct}%` }} />
      </div>
    </div>
  );
}
