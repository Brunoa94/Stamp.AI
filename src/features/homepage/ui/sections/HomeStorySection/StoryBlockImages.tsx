/**
 * StoryBlockImages
 *
 * Renders the image(s) for a story block in a white "stamp frame" card.
 * Single images display as a square, multiple images render as a 2x2
 * collage grid; photos inside the frame are rounded-lg.
 */

import Image from "next/image";
import type { HomeStoryBlockType } from "../../../lib/constants/homepageContent";

interface StoryBlockImagesProps {
  block: HomeStoryBlockType;
  alt: string;
}

export function StoryBlockImages({ block, alt }: StoryBlockImagesProps) {
  if (block.images.length > 1) {
    return (
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) p-2 shadow-(--shadow-stamp-card)">
        {block.images.map((src, index) => (
          <div
            key={src}
            className="relative aspect-square overflow-hidden rounded-lg bg-(--color-stamp-sage)"
          >
            <Image
              src={src}
              alt={index === 0 ? alt : ""}
              fill
              sizes="(max-width: 768px) 45vw, 192px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-(--color-stamp-divider) bg-(--color-stamp-white) p-2 shadow-(--shadow-stamp-card)">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-(--color-stamp-sage)">
        <Image
          src={block.images[0]}
          alt={alt}
          fill
          sizes="(max-width: 768px) 90vw, 384px"
          className="object-cover"
        />
      </div>
    </div>
  );
}
