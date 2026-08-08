import Image from "next/image";
import { useTranslations } from "next-intl";

/**
 * ResultsImage
 *
 * Displays the generated design result with hover effect
 */

interface PropsI {
  imageUrl: string;
}

export function ResultsImage({ imageUrl }: PropsI) {
  const t = useTranslations("stamp.results");

  return (
    <div className="aspect-square h-[45vh] md:h-[50vh] lg:h-[55vh] max-w-full mx-auto bg-white border border-(--color-stamp-divider) shadow-2xl flex items-center justify-center mb-6 overflow-hidden group relative">
      <Image
        src={imageUrl}
        alt={t("imageAlt")}
        fill
        className="object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 672px"
      />
    </div>
  );
}
