import { buildStampWallColumns } from "@/features/homepage/lib/helpers/stampWall";
import type { StampWallTileT } from "@/features/homepage/lib/types/stampWall";

const WALL = "/home/stamp-wall";

/**
 * Every product on the hero wall (320px crops of public/products-images), with
 * product lines interleaved so the round-robin deal mixes them. Tiles with a
 * `flipSrc` turn over from the customer's photo or logo to the printed product.
 */
const HERO_STAMP_WALL_TILES: readonly StampWallTileT[] = [
  { id: "canvas-a", src: `${WALL}/canvas-a-side.webp` },
  { id: "hoodie-a", src: `${WALL}/hoodie-a-front.webp` },
  { id: "mug-l", src: `${WALL}/mug-l-front.webp` },
  { id: "kid-b", src: `${WALL}/kid-t-shirt-b-photo.webp`, flipSrc: `${WALL}/kid-t-shirt-b-printed.webp` },
  { id: "tote-k", src: `${WALL}/tote-k-hanging.webp` },
  { id: "canvas-k", src: `${WALL}/canvas-k-front.webp` },
  { id: "kid-g", src: `${WALL}/kid-t-shirt-g-front.webp` },
  { id: "mug-j", src: `${WALL}/mug-j-front.webp` },
  { id: "hoodie-g", src: `${WALL}/hoodie-g-back.webp` },
  { id: "tote-b", src: `${WALL}/tote-b-photo.webp`, flipSrc: `${WALL}/tote-b-printed.webp` },
  { id: "canvas-l", src: `${WALL}/canvas-l-side.webp` },
  { id: "mug-a", src: `${WALL}/mug-a-front.webp` },
  { id: "hoodie-e", src: `${WALL}/hoodie-e-front.webp` },
  { id: "tote-n", src: `${WALL}/tote-n-hanging.webp` },
  { id: "kid-n", src: `${WALL}/kid-t-shirt-n-front.webp` },
  { id: "canvas-b", src: `${WALL}/canvas-b-front.webp` },
  { id: "tote-c", src: `${WALL}/tote-c-photo.webp`, flipSrc: `${WALL}/tote-c-printed.webp` },
  { id: "mug-k", src: `${WALL}/mug-k-front.webp` },
  { id: "hoodie-k", src: `${WALL}/hoodie-k-back.webp` },
  { id: "kid-l", src: `${WALL}/kid-t-shirt-l-front.webp` },
  { id: "canvas-c", src: `${WALL}/canvas-c-side.webp` },
  { id: "tote-m", src: `${WALL}/tote-m-front.webp` },
  { id: "kid-a", src: `${WALL}/kid-t-shirt-a-photo.webp`, flipSrc: `${WALL}/kid-t-shirt-a-printed.webp` },
  { id: "mug-e", src: `${WALL}/mug-e-front.webp` },
  { id: "hoodie-j", src: `${WALL}/hoodie-j-front.webp` },
  { id: "canvas-j", src: `${WALL}/canvas-j-side.webp` },
  { id: "tote-o", src: `${WALL}/tote-o-hanging.webp` },
  { id: "mug-h", src: `${WALL}/mug-h-front.webp` },
  { id: "kid-f", src: `${WALL}/kid-t-shirt-f-front.webp` },
  { id: "hoodie-c", src: `${WALL}/hoodie-c-front.webp` },
  { id: "tote-a", src: `${WALL}/tote-a-photo.webp`, flipSrc: `${WALL}/tote-a-printed.webp` },
  { id: "canvas-d", src: `${WALL}/canvas-d-front.webp` },
  { id: "mug-b", src: `${WALL}/mug-b-front.webp` },
  { id: "kid-m", src: `${WALL}/kid-t-shirt-m-back.webp` },
  { id: "hoodie-l", src: `${WALL}/hoodie-l-front.webp` },
  { id: "canvas-e", src: `${WALL}/canvas-e-side.webp` },
  { id: "tote-g", src: `${WALL}/tote-g-front.webp` },
  { id: "mug-pet-portrait", src: `${WALL}/mug-pet-portrait.webp` },
  { id: "kid-tshirt-drawing", src: `${WALL}/kid-tshirt-drawing.webp` },
  { id: "tote-botanical", src: `${WALL}/tote-botanical.webp` },
  { id: "hoodie-pet-portrait", src: `${WALL}/hoodie-pet-portrait.webp` },
  { id: "canvas-pet-renaissance", src: `${WALL}/canvas-pet-renaissance.webp` },
  { id: "mug-couple-cartoon", src: `${WALL}/mug-couple-cartoon.webp` },
  { id: "kid-tshirt-birthday", src: `${WALL}/kid-tshirt-birthday.webp` },
  { id: "tote-pet-line-art", src: `${WALL}/tote-pet-line-art.webp` },
  { id: "hoodie-couple", src: `${WALL}/hoodie-couple.webp` },
  { id: "canvas-family", src: `${WALL}/canvas-family.webp` },
  { id: "mug-watercolor-cat", src: `${WALL}/mug-watercolor-cat.webp` },
  { id: "kid-tshirt-space", src: `${WALL}/kid-tshirt-space.webp` },
  { id: "tote-beach-quote", src: `${WALL}/tote-beach-quote.webp` },
  { id: "hoodie-mountain", src: `${WALL}/hoodie-mountain.webp` },
  { id: "canvas-wedding", src: `${WALL}/canvas-wedding.webp` },
];

/**
 * Nine drifting columns, enough to span the tilted plane on wide screens. The
 * tiles are dealt twice so each column's single copy is taller than the plane
 * (the column renders that copy twice to loop).
 */
export const HERO_STAMP_WALL_COLUMNS = buildStampWallColumns(
  [...HERO_STAMP_WALL_TILES, ...HERO_STAMP_WALL_TILES],
  9,
);
