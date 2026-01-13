import { useCallback } from "react";
import { useImagePreview } from "./useImagePreview";
import { useDropzoneConfig } from "./useDropzoneConfig";

interface IUseImageUploadProps {
  onImageUpload: (file: File) => void;
  onRemoveImage: () => void;
}

export const useImageUpload = ({ onImageUpload, onRemoveImage }: IUseImageUploadProps) => {
  const { preview, createPreview, clearPreview } = useImagePreview();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];

    if (file) {
      onImageUpload(file);
      createPreview(file);
    }
  }, [onImageUpload, createPreview]);

  const { getRootProps, getInputProps, isDragActive } = useDropzoneConfig({
    onDrop,
  });

  const handleRemoveImage = useCallback(() => {
    onRemoveImage();
    clearPreview();
  }, [onRemoveImage, clearPreview]);

  return {
    preview,
    getRootProps,
    getInputProps,
    isDragActive,
    handleRemoveImage,
  };
};