/**
 * HomeStorySection
 *
 * Alternating image + text splits telling the Stamp AI story: AI design,
 * heavyweight quality and made-to-order production. Sits in a rounded panel
 * inside the page gutter, chocolate for the homepage's strong moments.
 */

import { HOME_STORY_BLOCKS } from "../../../lib/constants/homepageContent";
import { homePanelVariants } from "../../../lib/variants/homePanelVariants";
import { StoryBlock } from "./StoryBlock";

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
    <section className="px-4 py-20 sm:px-6 lg:px-12">
      <div className={homePanelVariants({ tone: background })}>
        <div className="space-y-16 lg:space-y-20">
          {blocksToRender.map((block) => (
            <StoryBlock key={block.id} block={block} inverted={isDark} />
          ))}
        </div>
      </div>
    </section>
  );
}
