"use client";

import { Button } from "@/components/ui/button";
import { X, Check, Sparkles } from "lucide-react";
import { componentThemes } from "@/theme";

interface PropsI {
  preview: string;
  fileName: string;
  fileSize: number;
  onRemove: () => void;
}

const ImagePreview = ({ preview, fileName, fileSize, onRemove }: PropsI) => {
  return (
    <div className={componentThemes.imagePreview.container}>
      <div className={componentThemes.imagePreview.wrapper}>
        {/* Colorful border wrapper */}
        <div className={componentThemes.imagePreview.border}>
          <img
            src={preview}
            alt="Uploaded preview"
            className={componentThemes.imagePreview.image}
          />
        </div>

        {/* Success badge */}
        <div className={componentThemes.imagePreview.successBadge}>
          <Check className="w-5 h-5 text-white" />
        </div>

        {/* Remove button */}
        <button
          className={componentThemes.imagePreview.removeButton}
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* File info */}
      <div className={componentThemes.imagePreview.info}>
        <div className="flex items-center justify-center mb-2">
          <Sparkles className="w-4 h-4 text-green-500 mr-2" />
          <p className="text-sm font-medium text-green-700">Ready to transform!</p>
        </div>
        <p className="text-xs text-green-600">
          {fileName} • {Math.round(fileSize / 1024)} KB
        </p>
      </div>
    </div>
  );
};

export default ImagePreview;