import Image from "next/image";

/**
 * ResultsImage
 *
 * Displays the generated design result with hover effect
 */

interface PropsI {
  imageUrl: string;
}

export function ResultsImage({ imageUrl }: PropsI) {
  return (
    <div className="aspect-square w-full bg-white border border-(--color-stamp-divider) shadow-2xl flex items-center justify-center mb-12 overflow-hidden group relative">
      <Image
        src={imageUrl}
        alt="Generated design result"
        fill
        className="object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 672px"
      />
    </div>
  );
}
