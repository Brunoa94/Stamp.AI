/**
 * HomeStorySection
 *
 * Alternating image + text splits telling the Stamp AI story: AI design,
 * heavyweight quality and made-to-order production.
 */

import { cn } from "@/lib/utils";
import { HOME_STORY_BLOCKS } from "../../lib/constants/homepageContent";
import { StoryBlock } from "../components/StorySection";

interface HomeStorySectionProps {
  /** Block IDs to render. If not provided, renders all blocks. */
  blockIds?: string[];
  /** Background variant: "cream" (default), "white", or "chocolate" */
  background?: "cream" | "white" | "chocolate";
}

export function HomeStorySection({ blockIds, background = "cream" }: HomeStorySectionProps = {}) {
  const blocksToRender = blockIds
    ? HOME_STORY_BLOCKS.filter((block) => blockIds.includes(block.id))
    : HOME_STORY_BLOCKS;

  const isDark = background === "chocolate";

  return (
    <section
      className={cn(
        "relative px-6 py-20 lg:px-12 xl:px-24 lg:py-28 overflow-hidden",
        background === "chocolate"
          ? "bg-(--color-stamp-chocolate)"
          : background === "white"
            ? "bg-(--color-stamp-white)"
            : "bg-(--color-stamp-cream)"
      )}
    >
      {/* Decorative corner accents */}
      <div className="absolute top-8 left-6 lg:left-12 xl:left-24 w-16 h-16 border-t-2 border-l-2 border-(--color-stamp-gold)/30 rounded-tl-lg" aria-hidden="true" />
      <div className="absolute top-8 right-6 lg:right-12 xl:right-24 w-16 h-16 border-t-2 border-r-2 border-(--color-stamp-gold)/30 rounded-tr-lg" aria-hidden="true" />

      {/* Additional corner frames for dark background */}
      {isDark && (
        <>
          <div className="absolute bottom-8 left-6 lg:left-12 xl:left-24 w-16 h-16 border-b-2 border-l-2 border-(--color-stamp-gold)/30 rounded-bl-lg" aria-hidden="true" />
          <div className="absolute bottom-8 right-6 lg:right-12 xl:right-24 w-16 h-16 border-b-2 border-r-2 border-(--color-stamp-gold)/30 rounded-br-lg" aria-hidden="true" />
        </>
      )}

      <div className="relative mx-auto max-w-7xl space-y-16 lg:space-y-20">
        {blocksToRender.map((block) => (
          <StoryBlock key={block.id} block={block} inverted={isDark} />
        ))}
      </div>
    </section>
  );
}
