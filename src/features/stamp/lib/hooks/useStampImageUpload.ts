"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useStampUpload } from "./useStampSelectors";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import {
  logStampError,
  logStampInfo,
  logStampWarn,
} from "../helpers/stampLogger";

/**
 * useStampImageUpload
 *
 * Hook for handling image upload functionality in Stamp.
 * Validates file type and size, creates preview, and stores in state.
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif"];

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

      // Create preview URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          const url = e.target?.result as string;
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
      const errorMsg = error instanceof Error ? error.message : t("uploadFailed");
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
