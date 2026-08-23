/**
 * Carousel Types
 *
 * Type definitions for the featured products carousel.
 */

export interface CarouselProductData {
  blueprintId: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string;
  href: string;
}
