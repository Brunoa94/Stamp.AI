import Image from "next/image";
import { UploadCloud } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import { stampCardVariants } from "../../../lib/variants/stampStudioVariants";

/**
 * UploadPreview
 *
 * The uploaded photo in the upload card (same size as the dropzone), with a
 * chocolate "replace" scrim on hover or keyboard focus.
 */

interface PropsI {
  imageUrl: string;
  onReplace: () => void;
}

export function UploadPreview({ imageUrl, onReplace }: PropsI) {
  const t = useTranslations("stamp.upload");

  return (
    <div
      className={cn(
        stampCardVariants(),
        "relative h-full min-h-56 w-full overflow-hidden rounded-2xl md:min-h-100",
      )}
    >
      <Image
        src={imageUrl}
        alt={t("previewAlt")}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
      <Button
        variant="unstyled"
        onClick={onReplace}
        className="group absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-transparent transition-colors duration-300 hover:bg-(--color-stamp-chocolate)/50 focus-visible:bg-(--color-stamp-chocolate)/50 focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-(--color-stamp-off-white)"
        aria-label={t("replaceAria")}
      >
        <UploadCloud className="mb-2 h-10 w-10 text-(--color-stamp-off-white) opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
        <Span
          variant="label"
          className="text-(--color-stamp-off-white) opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          {t("replace")}
        </Span>
      </Button>
    </div>
  );
}
