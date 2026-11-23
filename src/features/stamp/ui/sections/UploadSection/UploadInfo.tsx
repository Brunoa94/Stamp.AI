import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { cn } from "@/lib/utils";
import { stampCardVariants } from "../../../lib/variants/stampStudioVariants";

/**
 * UploadInfo
 *
 * Displays file information (name, size) with remove button
 */

interface PropsI {
  fileName: string;
  fileSize: string;
  onRemove: () => void;
}

export function UploadInfo({ fileName, fileSize, onRemove }: PropsI) {
  const t = useTranslations("stamp.upload");

  return (
    <div className={cn(stampCardVariants(), "mb-10 flex items-center gap-4 p-4")}>
      <div className="flex-1 min-w-0">
        <Paragraph
          variant="sm"
          className="text-(--color-stamp-chocolate) truncate mb-1"
        >
          {fileName}
        </Paragraph>
        <Span variant="micro" className="text-(--color-stamp-taupe)">
          {t("fileSize", { size: fileSize })}
        </Span>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onRemove}
        className="ml-auto shrink-0 text-(--color-stamp-taupe) transition-colors hover:bg-(--color-stamp-cream) hover:text-(--color-stamp-error)"
        aria-label={t("removeAria")}
      >
        <X className="w-5 h-5" />
      </Button>
    </div>
  );
}
