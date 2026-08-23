/**
 * Transform Showcase Constants
 *
 * Configuration for the hero transform showcase animation.
 */

export interface ImageType {
  src: string;
  alt: string;
}

export interface ImagePairType {
  photo: ImageType;
  printed: ImageType;
}

/** Image pairs: each index corresponds to the same design (photo + printed) */
export const IMAGE_PAIRS: ImagePairType[] = [
  {
    photo: {
      src: "/products-images/tote/tote-a-photo.png",
      alt: "Tote bag A design",
    },
    printed: {
      src: "/products-images/tote/tote-a-printed.png",
      alt: "Tote bag A printed",
    },
  },
  {
    photo: {
      src: "/products-images/tote/tote-b-photo.png",
      alt: "Tote bag B design",
    },
    printed: {
      src: "/products-images/tote/tote-b-printed.png",
      alt: "Tote bag B printed",
    },
  },
  {
    photo: {
      src: "/products-images/tote/tote-c-photo.png",
      alt: "Tote bag C design",
    },
    printed: {
      src: "/products-images/tote/tote-c-printed.png",
      alt: "Tote bag C printed",
    },
  },
  {
    photo: {
      src: "/products-images/kid t-shirt/kid-t-shirt-a-photo.png",
      alt: "Kids t-shirt A design",
    },
    printed: {
      src: "/products-images/kid t-shirt/kid-t-shirt-a-printed.png",
      alt: "Kids t-shirt A printed",
    },
  },
  {
    photo: {
      src: "/products-images/kid t-shirt/kid-t-shirt-b-photo.jpeg",
      alt: "Kids t-shirt B design",
    },
    printed: {
      src: "/products-images/kid t-shirt/kid-t-shirt-b-printed.png",
      alt: "Kids t-shirt B printed",
    },
  },
];

/** Animation timing in milliseconds */
export const DISPLAY_MS = 3000;
