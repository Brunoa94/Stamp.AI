import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { Button } from "@/features/ui/button";
import { UploadInfo } from "./UploadInfo";

/**
 * UploadContent
 *
 * Right panel content with heading, description, file info, and next button
 */

interface PropsI {
  hasUploadedImage: boolean;
  fileName?: string;
  fileSize?: string;
  onRemoveFile: () => void;
  onNext: () => void;
}

export function UploadContent({
  hasUploadedImage,
  fileName,
  fileSize,
  onRemoveFile,
  onNext,
}: PropsI) {
  return (
    <div className="p-12 lg:p-24 flex flex-col justify-center">
      <Span variant="sm" className="text-(--color-stamp-taupe) mb-6">
        Protocol 01 / Initiation
      </Span>

      <Heading
        as="h2"
        variant="title"
        className="text-(--color-stamp-chocolate) mb-6"
      >
        Upload{" "}
        <span className="font-serif italic lowercase font-light text-(--color-stamp-taupe)">
          Reference
        </span>
      </Heading>

      <Paragraph
        variant="card"
        className="text-(--color-stamp-taupe) mb-10 max-w-sm"
      >
        Provide a visual seed for the neural engine. This architectural
        floorplan will guide the synthesis loop.
      </Paragraph>

      {/* File Info Row */}
      {hasUploadedImage && fileName && fileSize && (
        <UploadInfo
          fileName={fileName}
          fileSize={fileSize}
          onRemove={onRemoveFile}
        />
      )}

      {/* Next Button */}
      <div>
        <Button
          onClick={onNext}
          className="w-full bg-(--color-stamp-chocolate) text-white hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) transition-all duration-300 px-8 py-6 text-xs font-bold tracking-[0.2em] uppercase"
        >
          Next Protocol
        </Button>
      </div>
    </div>
  );
}
