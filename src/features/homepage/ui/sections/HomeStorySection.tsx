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
  /** Background variant: "cream" (default) or "white" */
  background?: "cream" | "white";
}

export function HomeStorySection({ blockIds, background = "cream" }: HomeStorySectionProps = {}) {
  const blocksToRender = blockIds
    ? HOME_STORY_BLOCKS.filter((block) => blockIds.includes(block.id))
    : HOME_STORY_BLOCKS;

  return (
    <section
      className={cn(
        "px-6 py-16 lg:px-12 xl:px-24",
        background === "white"
          ? "bg-(--color-stamp-white)"
          : "bg-(--color-stamp-cream)"
      )}
    >
      <div className="mx-auto max-w-7xl space-y-16 lg:space-y-20">
        {blocksToRender.map((block) => (
          <StoryBlock key={block.id} block={block} />
        ))}
      </div>
    </section>
  );
}
