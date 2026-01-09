import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface IUseImageUploadProps {
  onImageUpload: (file: File) => void;
  onRemoveImage: () => void;
}

export const useImageUpload = ({ onImageUpload, onRemoveImage }: IUseImageUploadProps) => {
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

  const handleRemoveImage = useCallback(() => {
    onRemoveImage();
    setPreview(null);
  }, [onRemoveImage]);

  return {
    preview,
    getRootProps,
    getInputProps,
    isDragActive,
    handleRemoveImage,
  };
};