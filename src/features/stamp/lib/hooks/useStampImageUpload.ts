"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useStampUpload } from "./useStampSelectors";
import { useErrorHandler } from "@/shared/hooks/useErrorHandler";
import {
  logStampError,
  logStampInfo,
  logStampWarn,
} from "../helpers/stampLogger";

/**
 * useStampImageUpload
 *
 * Hook for handling image upload functionality in Stamp.
 * Validates file type, size, and image integrity before storing.
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif"];
const MIN_FILE_SIZE = 1; // Files must have at least 1 byte of content

/**
 * Validates that a data URL represents a decodable image.
 * Rejects empty or corrupt image files that browsers can't render.
 */
function validateImageDataUrl(dataUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // Image must have valid dimensions to be considered valid
      resolve(img.naturalWidth > 0 && img.naturalHeight > 0);
    };
    img.onerror = () => {
      resolve(false);
    };
    img.src = dataUrl;
  });
}

export function useStampImageUpload() {
  const t = useTranslations("stamp.errors.upload");
  const { setUploadedImageUrl } = useStampUpload();
  const { handleError, handleSuccess } = useErrorHandler();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadImage = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    setUploadError(null);

    try {
      // Validate file type
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        const error = t("invalidType");
        setUploadError(error);
        logStampWarn({
          scope: "useStampImageUpload",
          event: "upload_rejected_invalid_file_type",
          metadata: {
            fileType: file.type,
            fileName: file.name,
          },
        });
        handleError(new Error(error));
        return null;
      }

      // Validate file is not empty
      if (file.size < MIN_FILE_SIZE) {
        const error = t("invalidImage");
        setUploadError(error);
        logStampWarn({
          scope: "useStampImageUpload",
          event: "upload_rejected_empty_file",
          metadata: {
            fileName: file.name,
            fileSize: file.size,
          },
        });
        handleError(new Error(error));
        return null;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        const error = t("tooLarge");
        setUploadError(error);
        logStampWarn({
          scope: "useStampImageUpload",
          event: "upload_rejected_file_too_large",
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            maxFileSize: MAX_FILE_SIZE,
          },
        });
        handleError(new Error(error));
        return null;
      }

      // Create preview URL and validate image integrity
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
          const url = e.target?.result as string;

          // Validate that the file is actually a decodable image
          const isValidImage = await validateImageDataUrl(url);
          if (!isValidImage) {
            const error = t("invalidImage");
            setUploadError(error);
            logStampWarn({
              scope: "useStampImageUpload",
              event: "upload_rejected_corrupt_image",
              metadata: {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
              },
            });
            handleError(new Error(error));
            setIsUploading(false);
            resolve(null);
            return;
          }

          setUploadedImageUrl(url);
          logStampInfo({
            scope: "useStampImageUpload",
            event: "upload_succeeded",
            metadata: {
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
            },
          });
          handleSuccess(t("uploaded"));
          resolve(url);
        };

        reader.onerror = () => {
          const error = t("readFailed");
          setUploadError(error);
          logStampError({
            scope: "useStampImageUpload",
            event: "file_reader_failed",
            metadata: {
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
            },
          });
          handleError(new Error(error));
          reject(new Error(error));
        };

        reader.readAsDataURL(file);
      });
    } catch (error) {
      const errorMsg = error instanceof Error
        ? error.message
        : t("uploadFailed");
      setUploadError(errorMsg);
      logStampError({
        scope: "useStampImageUpload",
        event: "upload_failed",
        error,
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setUploadedImageUrl(null);
    setUploadError(null);
    logStampInfo({
      scope: "useStampImageUpload",
      event: "upload_removed",
    });
    handleSuccess(t("removed"));
  };

  return {
    uploadImage,
    removeImage,
    isUploading,
    uploadError,
  };
}
