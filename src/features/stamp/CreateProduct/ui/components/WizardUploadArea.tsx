"use client";

import { ImagePlus, Instagram, X } from "lucide-react";
import clsx from "clsx";
import { memo, useCallback, useEffect, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Button } from "@/features/ui/button";
import { animations, componentThemes } from "@/theme";
import { toast } from "sonner";

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

  const onDropRejected = useCallback(() => {
    toast.error("Upload failed", {
      description: "Please upload a JPG, PNG, or HEIC image up to 25MB.",
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
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
      <div className="w-14 h-14 sm:w-24 sm:h-24 rounded-xl flex items-center justify-center mb-4 sm:mb-8 transition-soft group-hover:scale-110 group-hover:-rotate-3 bg-white/5 backdrop-blur-3xl border border-white/40 shadow-[0_8px_32px_0_rgba(124,58,237,0.15),0_4px_12px_0_rgba(6,182,212,0.1),inset_0_1px_1px_0_rgba(255,255,255,0.4)]">
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient
              id="icon-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
        </svg>
        <ImagePlus
          className="w-7 h-7 sm:w-11 sm:h-11"
          style={{ stroke: "url(#icon-gradient)" }}
        />
      </div>

      {/* Text */}
      <h3 className="text-2xl sm:text-4xl font-heading mb-2 tracking-widest uppercase bg-linear-to-r from-[#1A2340] via-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">
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
