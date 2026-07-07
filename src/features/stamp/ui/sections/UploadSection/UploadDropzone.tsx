import { UploadCloud } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";

/**
 * UploadDropzone
 *
 * Empty state dropzone UI for file upload
 */

interface PropsI {
  onClick: () => void;
  uploadError?: string | null;
}

export function UploadDropzone({ onClick, uploadError }: PropsI) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="w-full h-full rounded-none border-2 border-dashed border-(--color-stamp-divider) hover:border-(--color-stamp-gold) hover:bg-transparent transition-colors duration-500 flex flex-col items-center justify-center p-12 cursor-pointer group min-h-100"
      aria-label="Upload reference image"
    >
      <div className="text-center group-hover:scale-105 transition-transform duration-500">
        <UploadCloud className="mx-auto text-6xl text-(--color-stamp-taupe)/40 mb-4 w-16 h-16" />
        <Paragraph
          variant="sm"
          className="text-(--color-stamp-chocolate) mb-2"
        >
          Upload Reference Image (Optional)
        </Paragraph>
        <Span variant="micro" className="text-(--color-stamp-taupe)">
          10MB max, JPG/PNG/GIF only
        </Span>
        {uploadError && (
          <Paragraph variant="sm" className="text-red-500 mt-4">
            {uploadError}
          </Paragraph>
        )}
      </div>
    </Button>
  );
}
