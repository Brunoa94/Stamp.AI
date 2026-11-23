/**
 * Static content for the marketplace-style homepage sections (category tiles
 * and the gift-ideas mosaic): which CDN image each tile uses and which
 * translation key labels it. Copy lives in `home.*` in the message files;
 * the images are product photos already on the static-assets CDN, under
 * `home/stamp-wall/`.
 */

import { staticAssetUrl } from "@/shared/helpers/staticAssetUrl";

const WALL = staticAssetUrl("/home/stamp-wall");

/** "Shop by category" tiles. Labels: `home.categories.items.<id>`. */
export const HOME_CATEGORY_TILES = [
  { id: "tees", src: `${WALL}/kid-tshirt-drawing.webp`, href: "/catalog" },
  { id: "hoodies", src: `${WALL}/hoodie-couple.webp`, href: "/catalog" },
  { id: "mugs", src: `${WALL}/mug-couple-cartoon.webp`, href: "/catalog" },
  { id: "totes", src: `${WALL}/tote-pet-line-art.webp`, href: "/catalog" },
  { id: "canvas", src: `${WALL}/canvas-pet-renaissance.webp`, href: "/catalog" },
  { id: "kids", src: `${WALL}/kid-tshirt-space.webp`, href: "/catalog" },
] as const;

/**
 * Gift-idea mosaic. The first tile is the large one. Labels:
 * `home.giftIdeas.tiles.<id>`.
 */
export const GIFT_IDEA_TILES = [
  { id: "birthdays", src: `${WALL}/kid-tshirt-birthday.webp` },
  { id: "weddings", src: `${WALL}/canvas-wedding.webp` },
  { id: "pets", src: `${WALL}/mug-pet-portrait.webp` },
  { id: "family", src: `${WALL}/canvas-family.webp` },
  { id: "adventures", src: `${WALL}/tote-beach-quote.webp` },
] as const;
