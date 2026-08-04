"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/features/ui/input";
import { useStampNavigation } from "../../../lib/hooks/useStampNavigation";
import { useStampUpload } from "../../../lib/hooks/useStampSelectors";
import { useStampImageUpload } from "../../../lib/hooks/useStampImageUpload";
import { UploadDropzone } from "./UploadDropzone";
import { UploadPreview } from "./UploadPreview";
import { UploadContent } from "./UploadContent";
import { AnalyticsService } from "@/services/analyticsService";

/**
 * UploadSection
 *
 * Step 1: Upload reference image (optional)
 * Protocol 01 / Initiation
 */

export function UploadSection() {
  const t = useTranslations("stamp.upload");
  const { nextStep } = useStampNavigation();
  const { uploadedImageUrl } = useStampUpload();
  const { uploadImage, removeImage, uploadError } = useStampImageUpload();

  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadImage(file);
    if (url) {
      setFileName(file.name);
      setFileSize((file.size / 1024 / 1024).toFixed(2));

      AnalyticsService.track("stamp_image_upload", {
        step: "upload",
        file_type: file.type,
        file_size_kb: Math.round(file.size / 1024),
      });
    }
  };

  const handleRemove = () => {
    removeImage();
    setFileName("");
    setFileSize("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <section
      id="step-1"
      className="h-full overflow-y-auto grid grid-cols-1 lg:grid-cols-2 border-b border-(--color-stamp-divider)"
    >
      {/* Hidden file input */}
      <Input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept=".jpg,.jpeg,.png,.gif"
        aria-label={t("inputAria")}
      />

      {/* Left Panel: Upload Dropzone / Image Preview */}
      <div className="relative flex items-center justify-center bg-(--color-stamp-divider)/5 overflow-hidden p-12 lg:p-24">
        {uploadedImageUrl ? (
          <UploadPreview
            imageUrl={uploadedImageUrl}
            onReplace={handleDropzoneClick}
          />
        ) : (
          <UploadDropzone
            onClick={handleDropzoneClick}
            uploadError={uploadError}
          />
        )}
      </div>

      {/* Right Panel: Content */}
      <UploadContent
        hasUploadedImage={Boolean(uploadedImageUrl)}
        fileName={fileName}
        fileSize={fileSize}
        onRemoveFile={handleRemove}
        onNext={nextStep}
      />
    </section>
  );
}
