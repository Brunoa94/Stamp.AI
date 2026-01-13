import { useState, useCallback, useRef, useEffect } from "react";

export const useImagePreview = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileReaderRef = useRef<FileReader | null>(null);

  // Cleanup FileReader on unmount
  useEffect(() => {
    return () => {
      if (fileReaderRef.current) {
        fileReaderRef.current.abort();
      }
    };
  }, []);

  const createPreview = useCallback((file: File) => {
    // Abort previous FileReader if still reading
    if (fileReaderRef.current) {
      fileReaderRef.current.abort();
    }

    // Create preview
    const reader = new FileReader();
    fileReaderRef.current = reader;

    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };

    reader.onerror = () => {
      console.error("FileReader error");
      fileReaderRef.current = null;
    };

    reader.onloadend = () => {
      fileReaderRef.current = null;
    };

    reader.readAsDataURL(file);
  }, []);

  const clearPreview = useCallback(() => {
    setPreview(null);
  }, []);

  return {
    preview,
    createPreview,
    clearPreview,
  };
};
