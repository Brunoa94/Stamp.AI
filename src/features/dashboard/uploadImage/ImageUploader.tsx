"use client";

import ImagePreview from "./ImagePreview";
import clsx from "clsx";
import { colors } from "@/theme";
import { useImageUpload } from "./useImageUpload";
import UploadIcon from "./uploadBox/UploadIcon";
import UploadText from "./uploadBox/UploadText";
import UploadButton from "./uploadBox/UploadButton";

const uploadZoneStyles = {
  base: `border-3 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 transform hover:scale-105 ${colors.uploadZoneBase}`,
  idle: `border-purple-300 hover:border-purple-400 ${colors.uploadZoneHover} hover:shadow-lg hover:shadow-purple-500/20`,
  active: `border-pink-400 ${colors.uploadZoneActive} shadow-xl shadow-pink-500/25 animate-pulse`,
};

interface PropsI {
  onImageUpload: (file: File) => void;
  uploadedImage?: File | null;
  onRemoveImage: () => void;
}

const ImageUploader = ({
  onImageUpload,
  uploadedImage,
  onRemoveImage,
}: PropsI) => {
  const {
    preview,
    getRootProps,
    getInputProps,
    isDragActive,
    handleRemoveImage,
  } = useImageUpload({ onImageUpload, onRemoveImage });

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
      className={clsx(uploadZoneStyles.base, {
        [uploadZoneStyles.active]: isDragActive,
        [uploadZoneStyles.idle]: !isDragActive,
      })}
    >
      <input {...getInputProps()} />
      <div className="space-y-6">
        <UploadIcon isDragActive={isDragActive} />
        <UploadText isDragActive={isDragActive} />
        <UploadButton isDragActive={isDragActive} />
      </div>
    </div>
  );
};

export default ImageUploader;
