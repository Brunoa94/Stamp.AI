"use client";

import { ImagePlus, Instagram, X } from "lucide-react";
import clsx from "clsx";
import { useCallback, useState } from "react";
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
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        onImageUpload(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
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
    setPreview(null);
    onRemoveImage();
  };

  // If image is uploaded, show preview
  if (uploadedImage && preview) {
    return (
      <div className={clsx(previewStyles.container, animations.fadeInScale)}>
        <div
          className={clsx(previewStyles.imageWrapper, colors.purpleBorder)}
          style={{ boxShadow: shadows.elevated }}
        >
          <div className={previewStyles.imageContainer}>
            <Image
              src={preview}
              alt="Uploaded preview"
              width={400}
              height={400}
              className="w-full h-auto object-contain max-h-[300px]"
            />
          </div>
          <Button
            onClick={handleRemoveImage}
            variant="destructive"
            size="icon"
            className="absolute top-3 right-3 rounded-full shadow-lg transition-all hover:scale-110"
            aria-label="Remove image"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className={previewStyles.fileInfo}>
          <p className={previewStyles.fileName}>{uploadedImage.name}</p>
          <p className={previewStyles.fileSize}>
            {(uploadedImage.size / 1024 / 1024).toFixed(2)} MB
          </p>
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
      <p className="text-slate-500 mb-5 sm:mb-10 text-sm sm:text-lg font-accent italic">
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
