"use client";

import { ImagePlus, Instagram, X } from "lucide-react";
import clsx from "clsx";
import { memo, useCallback, useEffect, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Button } from "@/features/ui/button";
import { shadows, colors, animations, componentThemes } from "@/theme";

interface WizardUploadAreaProps {
  onImageUpload: (file: File) => void;
  uploadedImage?: File | null;
  onRemoveImage: () => void;
}

export function WizardUploadArea({
  onImageUpload,
  uploadedImage,
  onRemoveImage,
}: WizardUploadAreaProps) {
  const uploadAreaStyles = componentThemes.wizardUploadArea.uploadArea;
  const previewStyles = componentThemes.wizardUploadArea.preview;

  const previewUrl = useMemo(() => {
    if (!uploadedImage) {
      return null;
    }

    return URL.createObjectURL(uploadedImage);
  }, [uploadedImage]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        onImageUpload(file);
      }
    },
    [onImageUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".heic"],
    },
    maxSize: 25 * 1024 * 1024, // 25MB
    multiple: false,
  });

  const handleRemoveImage = () => {
    onRemoveImage();
  };

  // If image is uploaded, show preview
  if (uploadedImage && previewUrl) {
    return (
      <div
        className={clsx(
          previewStyles.container,
          animations.fadeInScale,
          "px-2 sm:px-4",
        )}
      >
        <div className="relative mx-auto w-fit max-w-full rounded-4xl bg-linear-to-r from-[#AF8CFF]/70 via-[#C9B8FF]/45 to-[#57D8DE]/70 p-0.5">
          <div className="relative w-fit max-w-full rounded-[1.9rem] border border-white/70 bg-white/92 p-3 backdrop-blur-sm sm:p-4">
            <div className="flex h-96 w-64 items-center justify-center overflow-hidden rounded-3xl bg-[#F7F7F5] sm:h-112 sm:w-80">
              <Image
                src={previewUrl}
                alt="Uploaded preview"
                width={400}
                height={600}
                className="block h-auto max-h-full w-auto max-w-full object-contain"
              />
            </div>

            <Button
              onClick={handleRemoveImage}
              type="button"
              variant="outline"
              size="icon-sm"
              className="absolute -right-2 -top-2 h-9 w-9 rounded-full border border-rose-200/80 bg-white/90 text-rose-700 shadow-md backdrop-blur-md transition-all hover:scale-105 hover:bg-rose-50 hover:text-rose-800 sm:-right-3 sm:-top-3 sm:h-10 sm:w-10"
              aria-label="Remove image"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Upload area
  return (
    <div
      {...getRootProps()}
      className={clsx(uploadAreaStyles.base, {
        [uploadAreaStyles.active]: isDragActive,
      })}
    >
      <input {...getInputProps()} />

      {/* Icon */}
      <div
        className={clsx(
          "w-16 h-16 sm:w-28 sm:h-28 bg-white rounded-lg flex items-center justify-center mb-4 sm:mb-8 transition-soft group-hover:scale-110 group-hover:-rotate-3",
          colors.purpleText,
        )}
        style={{ boxShadow: shadows.float }}
      >
        <ImagePlus className="w-8 h-8 sm:w-12 sm:h-12" />
      </div>

      {/* Text */}
      <h3 className="text-2xl sm:text-4xl font-normal font-heading text-slate-900 mb-2 tracking-wide">
        Select Image to Upload
      </h3>
      <p className="text-slate-500 mb-5 sm:mb-10 text-sm sm:text-lg font-sans">
        Or drag and drop your file here
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 w-full sm:w-auto">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full sm:w-auto px-8 sm:px-10 py-4 bg-white border border-slate-200 text-slate-700 font-normal font-heading text-lg sm:text-xl tracking-widest rounded-sm shadow-sm hover:border-purple-600 hover:text-purple-600 transition-soft"
        >
          Choose File
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          className="hidden sm:flex text-slate-400 hover:text-purple-600 transition-soft"
          aria-label="Upload from Instagram"
        >
          <Instagram className="text-3xl w-8 h-8" />
        </Button>
      </div>

      {/* Info Text */}
      <p className={uploadAreaStyles.infoText}>
        Supported formats: JPG, PNG, HEIC up to 25MB
      </p>
    </div>
  );
}

export const MemoizedWizardUploadArea = memo(WizardUploadArea);
