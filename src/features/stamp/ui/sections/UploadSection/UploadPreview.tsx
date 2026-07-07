import Image from "next/image";
import { UploadCloud } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";

/**
 * UploadPreview
 *
 * Displays uploaded image with replace overlay on hover
 */

interface PropsI {
  imageUrl: string;
  onReplace: () => void;
}

export function UploadPreview({ imageUrl, onReplace }: PropsI) {
  return (
    <>
      <Image
        src={imageUrl}
        alt="Uploaded reference preview"
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
      <Button
        variant="ghost"
        onClick={onReplace}
        className="absolute inset-0 h-auto w-auto rounded-none flex flex-col items-center justify-center bg-black/0 hover:bg-black/40 transition-colors duration-500 cursor-pointer group"
        aria-label="Replace uploaded image"
      >
        <UploadCloud className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 mb-2" />
        <Span
          variant="micro"
          className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 tracking-widest"
        >
          REPLACE
        </Span>
      </Button>
    </>
  );
}
