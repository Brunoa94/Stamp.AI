/**
 * StoryBlockImages
 *
 * Renders the image(s) for a story block. Single images display as a square,
 * multiple images render as a 2x2 collage grid.
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
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {block.images.map((src, index) => (
          <div
            key={src}
            className="relative aspect-square overflow-hidden border border-(--color-stamp-divider) bg-(--color-stamp-white)"
          >
            <Image
              src={src}
              alt={index === 0 ? alt : ""}
              fill
              sizes="(max-width: 1024px) 40vw, 160px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative aspect-square overflow-hidden border border-(--color-stamp-divider) bg-(--color-stamp-white)">
      <Image
        src={block.images[0]}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 80vw, 320px"
        className="object-cover"
      />
    </div>
  );
}
