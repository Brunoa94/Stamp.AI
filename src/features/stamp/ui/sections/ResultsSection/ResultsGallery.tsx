import Image from "next/image";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import type { GeneratedResultType } from "../../../lib/types/stampFlowTypes";

/**
 * ResultsGallery
 *
 * Displays a horizontal scrollable gallery of previously generated images.
 * Only shown when there are multiple results to choose from.
 */

interface PropsI {
  results: GeneratedResultType[];
  selectedImageUrl: string | undefined;
  onSelectImage: (imageUrl: string, enhancedPrompt: string) => void;
}

export function ResultsGallery({
  results,
  selectedImageUrl,
  onSelectImage,
}: PropsI) {
  const t = useTranslations("stamp.results");

  // Only show gallery if there are multiple results
  if (results.length <= 1) {
    return null;
  }

  return (
    <div className="mb-6 w-full max-w-[min(100%,45vh)] md:max-w-[min(100%,50vh)] lg:max-w-[min(100%,55vh)] mx-auto">
      <Span variant="micro" className="text-(--color-stamp-taupe) mb-2 block">
        {t("previousCreations")}
      </Span>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-(--color-stamp-divider) scrollbar-track-transparent">
        {results.map((result, index) => {
          const isSelected = result.imageUrl === selectedImageUrl;
          return (
            <Button
              key={`${index}-${result.imageUrl.slice(-20)}`}
              type="button"
              variant="stamp-thumbnail"
              onClick={() => onSelectImage(result.imageUrl, result.enhancedPrompt)}
              className="group"
              aria-label={t("selectImage", { number: index + 1 })}
              aria-pressed={isSelected}
            >
              <Image
                src={result.imageUrl}
                alt={t("galleryImageAlt", { number: index + 1 })}
                fill
                className={cn(
                  "object-cover transition-all duration-300",
                  isSelected ? "" : "grayscale group-hover:grayscale-0"
                )}
                sizes="80px"
              />
              {isSelected && (
                <div className="absolute inset-0 bg-(--color-stamp-gold)/20 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-(--color-stamp-gold) flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
