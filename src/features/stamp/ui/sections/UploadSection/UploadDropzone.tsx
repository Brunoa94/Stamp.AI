import { UploadCloud } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";

/**
 * UploadDropzone
 *
 * Empty state of the upload card: a white rounded panel with a dashed
 * border that darkens and fills cream on hover.
 */

interface PropsI {
  onClick: () => void;
  uploadError?: string | null;
}

export function UploadDropzone({ onClick, uploadError }: PropsI) {
  const t = useTranslations("stamp.upload");

  return (
    <Button
      variant="unstyled"
      onClick={onClick}
      className="group flex h-full min-h-56 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-(--color-stamp-chocolate)/25 bg-(--color-stamp-white) p-8 transition-colors duration-300 hover:border-(--color-stamp-chocolate)/60 hover:bg-(--color-stamp-cream) focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-stamp-chocolate) md:min-h-100 md:p-12"
      aria-label={t("dropzoneAria")}
    >
      <div className="text-center transition-transform duration-300 group-hover:scale-105">
        <UploadCloud className="mx-auto mb-4 h-16 w-16 text-(--color-stamp-gold)" />
        <Paragraph
          variant="sm"
          className="text-(--color-stamp-chocolate) mb-2"
        >
          {t("dropzoneText")}
        </Paragraph>
        <Span variant="micro" className="text-(--color-stamp-taupe)">
          {t("dropzoneHint")}
        </Span>
        {uploadError && (
          <Paragraph variant="xs" className="text-(--color-stamp-error) mt-4">
            {uploadError}
          </Paragraph>
        )}
      </div>
    </Button>
  );
}
