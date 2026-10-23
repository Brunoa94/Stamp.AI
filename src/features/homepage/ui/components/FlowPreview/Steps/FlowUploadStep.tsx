"use client";

import { CloudUpload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { FlowStepTitle } from "../Mock/FlowStepTitle";
import { FlowMockButton } from "../Mock/FlowMockButton";
import { FlowArtImage } from "../Mock/FlowArtImage";

interface PropsI {
  isUploaded: boolean;
}

/**
 * FlowUploadStep
 *
 * Step 01: the drop zone, which fills with the sample photo partway through.
 */
export function FlowUploadStep({ isUploaded }: PropsI) {
  const t = useTranslations("home.flowPreview.upload");

  return (
    <div className="animate-flow-fade flex flex-col gap-4 px-6 py-8 sm:px-10">
      <FlowStepTitle messageKey="upload.title" />
      <Paragraph variant="caption" className="text-sm leading-relaxed text-(--color-stamp-chocolate)/80">
        {t("description")}
      </Paragraph>

      <div className="flex h-55 items-center justify-center border-2 border-dashed border-(--color-stamp-gold) bg-(--color-stamp-white)">
        {isUploaded ? (
          <div className="animate-flow-pop">
            <FlowArtImage art="pupPhoto" className="w-42.5" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <CloudUpload className="size-5.5 text-(--color-stamp-taupe)" strokeWidth={1.8} />
            <Span unstyled className="text-sm text-(--color-stamp-chocolate)">
              {t("dropTitle")}
            </Span>
            <Span variant="pill" className="font-semibold tracking-widest text-(--color-stamp-taupe)">
              {t("dropHint")}
            </Span>
          </div>
        )}
      </div>

      {isUploaded && (
        <div className="animate-flow-fade flex items-center justify-between border border-(--color-stamp-chocolate)/10 bg-(--color-stamp-white) px-3.5 py-2.5">
          <div className="flex flex-col gap-0.5">
            <Span unstyled className="text-xs text-(--color-stamp-chocolate)">
              {t("fileName")}
            </Span>
            <Span unstyled className="text-2xs text-(--color-stamp-taupe)">
              {t("fileSize")}
            </Span>
          </div>
          <X className="size-4 text-(--color-stamp-taupe)" />
        </div>
      )}

      <FlowMockButton tone={isUploaded ? "gold" : "dark"} className="mt-1">
        {isUploaded ? t("next") : t("skip")}
      </FlowMockButton>
    </div>
  );
}
