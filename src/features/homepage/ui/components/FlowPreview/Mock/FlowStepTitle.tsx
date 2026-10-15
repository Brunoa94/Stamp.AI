"use client";

import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";

interface PropsI {
  /** Rich message under home.flowPreview, e.g. "Your <accent>creation</accent>" */
  messageKey: string;
  className?: string;
}

/**
 * FlowStepTitle
 *
 * Mock screen title: slab-serif lead with a handwritten accent word.
 */
export function FlowStepTitle({ messageKey, className }: PropsI) {
  const t = useTranslations("home.flowPreview");

  return (
    <Heading
      as="div"
      variant="preview"
      className={cn("text-(--color-stamp-chocolate)", className)}
    >
      {t.rich(messageKey, {
        accent: (chunks) => (
          <Span variant="script" className="text-(--color-stamp-taupe)">
            {chunks}
          </Span>
        ),
        br: () => <br />,
      })}
    </Heading>
  );
}
