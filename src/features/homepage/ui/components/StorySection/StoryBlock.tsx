/**
 * StoryBlock
 *
 * A single story block with image and content columns.
 * Supports left or right image positioning.
 */

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Span } from "@/features/ui/span";
import type { HomeStoryBlockType } from "../../../lib/constants/homepageContent";
import { SectionReveal } from "../SectionReveal";
import { StoryBlockImages } from "./StoryBlockImages";
import { StoryBlockContent } from "./StoryBlockContent";

interface StoryBlockProps {
  block: HomeStoryBlockType;
}

export function StoryBlock({ block }: StoryBlockProps) {
  const t = useTranslations("home.story");

  return (
    <SectionReveal fadeOnScroll>
      <article className="flex flex-col items-center gap-8 md:flex-row md:gap-12 lg:gap-16">
        <div
          className={cn(
            "w-full max-w-xs shrink-0 md:w-64 lg:w-80",
            block.imagePosition === "left" && "md:order-first",
            block.imagePosition === "right" && "md:order-last"
          )}
        >
          <StoryBlockImages
            block={block}
            alt={t(`blocks.${block.id}.imageAlt`)}
          />
        </div>

        <StoryBlockContent
          eyebrow={t(`blocks.${block.id}.eyebrow`)}
          title={t.rich(`blocks.${block.id}.title`, {
            accent: (chunks) => (
              <Span variant="serif" className="text-(--color-stamp-taupe)">
                {chunks}
              </Span>
            ),
          })}
          body={t(`blocks.${block.id}.body`)}
          cta={t(`blocks.${block.id}.cta`)}
          href={block.href}
        />
      </article>
    </SectionReveal>
  );
}
