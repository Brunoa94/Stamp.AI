import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";

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
    <div className="mb-10 p-4 border border-(--color-stamp-divider) bg-white flex items-center gap-4">
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
        className="ml-auto text-(--color-stamp-taupe) hover:text-red-500 hover:bg-transparent transition-colors shrink-0"
        aria-label={t("removeAria")}
      >
        <X className="w-5 h-5" />
      </Button>
    </div>
  );
}
