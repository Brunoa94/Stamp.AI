import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { stampCardVariants } from "../../../lib/variants/stampStudioVariants";

/**
 * ResultsImage
 *
 * The generated design in a white stamp-frame card, the photo rounded inside.
 */

interface PropsI {
  imageUrl: string;
}

export function ResultsImage({ imageUrl }: PropsI) {
  const t = useTranslations("stamp.results");

  return (
    <div
      className={cn(
        stampCardVariants(),
        "aspect-square h-[45vh] md:h-[50vh] lg:h-[55vh] max-w-full mx-auto mb-6 p-2",
      )}
    >
      <div className="group relative h-full w-full overflow-hidden rounded-lg bg-(--color-stamp-cream)">
        <Image
          src={imageUrl}
          alt={t("imageAlt")}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 672px"
        />
      </div>
    </div>
  );
}
