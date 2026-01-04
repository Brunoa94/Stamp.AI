"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon } from "lucide-react";
import ImagePreview from "./ImagePreview";
import clsx from "clsx";
import { componentThemes, colors } from "@/theme";

interface PropsI {
  onImageUpload: (file: File) => void;
  uploadedImage?: File | null;
  onRemoveImage: () => void;
}

const ImageUploader = ({ onImageUpload, uploadedImage, onRemoveImage }: PropsI) => {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      onImageUpload(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleRemoveImage = () => {
    onRemoveImage();
    setPreview(null);
  };

  if (uploadedImage && preview) {
    return (
      <ImagePreview
        preview={preview}
        fileName={uploadedImage.name}
        fileSize={uploadedImage.size}
        onRemove={handleRemoveImage}
      />
    );
  }

  return (
    <div
      {...getRootProps()}
      className={clsx(
        // Base styles from theme
        componentThemes.uploadZone.base,

        // Conditional styles
        {
          // Active drag state
          [componentThemes.uploadZone.active]: isDragActive,
          // Idle state
          [componentThemes.uploadZone.idle]: !isDragActive,
        }
      )}
    >
      <input {...getInputProps()} />
      <div className="space-y-6">
        {/* Upload icon with animation */}
        <div className="mx-auto w-16 h-16 flex items-center justify-center">
          <div className={clsx(
            componentThemes.uploadZone.icon,
            {
              "animate-bounce": isDragActive,
              "animate-[float_3s_ease-in-out_infinite]": !isDragActive,
            }
          )}>
            <Upload className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Text content */}
        <div className="space-y-2">
          <p className={colors.textGradient + " text-xl font-bold"}>
            {isDragActive ? "Drop your magical image here! ✨" : "Upload Your Creative Canvas"}
          </p>
          <p className="text-sm text-gray-600 max-w-xs mx-auto">
            Drag & drop or click to select your image
            <br />
            <span className="text-xs text-gray-500">PNG, JPG, GIF, WEBP supported</span>
          </p>
        </div>

        {/* Action button */}
        <div className={clsx({
          "animate-pulse": isDragActive,
        })}>
          <Button
            variant="outline"
            className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
          >
            <ImageIcon className="mr-2 h-5 w-5 text-purple-500" />
            <span className={colors.textGradient + " font-semibold"}>
              Choose Your Image
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;