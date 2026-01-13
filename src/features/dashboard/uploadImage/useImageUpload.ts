import { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";

interface IUseImageUploadProps {
  onImageUpload: (file: File) => void;
  onRemoveImage: () => void;
  isFirstTry: { current: boolean };
  uploadedImage?: File | null;
}

export const useImageUpload = ({ onImageUpload, onRemoveImage, isFirstTry, uploadedImage }: IUseImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileReaderRef = useRef<FileReader | null>(null);
  const currentFileRef = useRef<File | null>(null);

  // Cleanup FileReader on unmount
  useEffect(() => {
    return () => {
      if (fileReaderRef.current) {
        fileReaderRef.current.abort();
      }
    };
  }, []);

  // Generate preview when uploadedImage changes
  useEffect(() => {
    if (uploadedImage && uploadedImage !== currentFileRef.current) {
      currentFileRef.current = uploadedImage;

      // Abort previous FileReader if still reading
      if (fileReaderRef.current) {
        fileReaderRef.current.abort();
      }

      const reader = new FileReader();
      fileReaderRef.current = reader;

      reader.onload = (e) => {
        if (currentFileRef.current === uploadedImage) {
          setPreview(e.target?.result as string);
        }
      };

      reader.onerror = () => {
        console.error("FileReader error");
        fileReaderRef.current = null;
      };

      reader.onloadend = () => {
        fileReaderRef.current = null;
      };

      reader.readAsDataURL(uploadedImage);
    } else if (!uploadedImage && preview) {
      setPreview(null);
      currentFileRef.current = null;
    }
  }, [uploadedImage, preview]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];

    isFirstTry.current = false;

    if (file) {
      currentFileRef.current = file;
      onImageUpload(file);

      // Abort previous FileReader if still reading
      if (fileReaderRef.current) {
        fileReaderRef.current.abort();
      }

      // Create preview
      const reader = new FileReader();
      fileReaderRef.current = reader;

      reader.onload = (e) => {
        if (currentFileRef.current === file) {
          setPreview(e.target?.result as string);
        }
      };

      reader.onerror = () => {
        console.error("FileReader error");
        fileReaderRef.current = null;
      };

      reader.onloadend = () => {
        fileReaderRef.current = null;
      };

      reader.readAsDataURL(file);
    }
  }, [onImageUpload, isFirstTry]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleRemoveImage = useCallback(() => {
    currentFileRef.current = null;
    onRemoveImage();
    setPreview(null);
  }, [onRemoveImage]);

  // Handle click to set isFirstTry to false
  const handleClick = useCallback(() => {
    isFirstTry.current = false;
  }, [isFirstTry]);

  // Wrap getRootProps to include click handler
  const wrappedGetRootProps = useCallback(() => {
    const rootProps = getRootProps();
    return {
      ...rootProps,
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        handleClick();
        rootProps.onClick?.(e as any);
      }
    };
  }, [getRootProps, handleClick]);

  return {
    preview,
    getRootProps: wrappedGetRootProps,
    getInputProps,
    isDragActive,
    handleRemoveImage,
  };
};