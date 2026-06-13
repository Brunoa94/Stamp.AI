"use client";

import { useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useFormContext } from "react-hook-form";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Button } from "@/features/ui/button";
import { cn } from "@/lib/utils";
import { UploadCloud, ArrowRight, Trash2 } from "lucide-react";
import type { StampFormData } from "../../lib/schemas/stampFormSchema";

interface PropsI {
  onNext?: () => void;
}

export function UploadDropzone({ onNext }: PropsI) {
  const { watch, setValue } = useFormContext<StampFormData>();
  const referenceImage = watch("referenceImage");
  const dragCounterRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    dragCounterRef.current = 0;
    setIsDragging(false);

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setValue("referenceImage", file, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (dragCounterRef.current === 1) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    noClick: false,
    noDrag: false,
    noDragEventsBubbling: true,
  });

  const handleRemove = () => {
    setValue("referenceImage", undefined);
  };

  useEffect(() => {
    if (referenceImage) {
      const url = URL.createObjectURL(referenceImage);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImageUrl(null);
    }
  }, [referenceImage]);

  if (referenceImage && imageUrl) {
    return (
      <div className="space-y-4">
        <div className="relative group">
          <Button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 z-10 p-2 bg-red-500 text-white rounded-none hover:bg-red-600 transition-colors shadow-lg h-auto"
            aria-label="Remove image"
          >
            <Trash2 className="w-5 h-5" />
          </Button>

          <div className="border-2 border-brandPurple/40 bg-white/60 backdrop-blur-sm p-8 transition-all shadow-[8px_8px_0px_rgba(147,51,234,0.1)]">
            <img
              src={imageUrl}
              alt="Uploaded reference"
              className="w-full h-auto max-h-96 object-contain"
            />
          </div>
        </div>

        {onNext && (
          <Button
            type="button"
            onClick={onNext}
            variant="default"
            className="w-full rounded-none bg-brandCyan/90! text-white px-10 py-3.5 font-anton text-sm tracking-widest uppercase hover:bg-brandCyan hover:text-ink transition-colors flex items-center justify-center gap-2"
          >
            Next Step
            <ArrowRight className="w-5 h-5" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      {...getRootProps({
        onDragEnter: handleDragEnter,
        onDragLeave: handleDragLeave,
        onDragOver: handleDragOver,
      })}
      className={cn(
        "group relative border-2 border-dashed border-brandPurple/20 bg-white/40 backdrop-blur-sm p-16 md:p-32 flex flex-col items-center justify-center text-center hover:border-brandPurple hover:bg-brandPurple/5 transition-all cursor-pointer shadow-[0_20px_50px_rgba(147,51,234,0.05)]",
        isDragging && "border-brandPurple bg-brandPurple/10",
      )}
    >
      <input {...getInputProps()} />

      <div className="w-20 h-20 bg-concrete border border-ink/10 flex items-center justify-center mb-8 group-hover:border-brandCyan transition-colors">
        <UploadCloud className="w-12 h-12 opacity-30 group-hover:text-brandCyan group-hover:opacity-100 transition-all" />
      </div>

      <Heading variant="card" className="mb-4">
        {isDragging ? "Drop your asset here" : "Drag and drop your asset"}
      </Heading>

      <Paragraph variant="card" className="opacity-30 mb-10">
        PNG, JPG, WEBP (MAX 10MB)
      </Paragraph>

      <Button
        type="button"
        variant="outline"
        className="h-auto rounded-none border-2 border-ink px-10 py-3.5 font-anton text-sm tracking-widest uppercase hover:bg-brandPurple hover:text-white hover:border-brandPurple transition-all"
      >
        Browse Terminal
      </Button>
    </div>
  );
}
