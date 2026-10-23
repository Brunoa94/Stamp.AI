"use client";

import { Package, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import type { FlowFrameType, FlowStepIdType } from "@/features/homepage/lib/types/flowPreview";
import { FlowUploadStep } from "../Steps/FlowUploadStep";
import { FlowDescribeStep } from "../Steps/FlowDescribeStep";
import { FlowGeneratingStep } from "../Steps/FlowGeneratingStep";
import { FlowResultsStep } from "../Steps/FlowResultsStep";
import { FlowProductStep } from "../Steps/FlowProductStep";
import { FlowCustomizeStep } from "../Steps/FlowCustomizeStep";
import { FlowFinalStep } from "../Steps/FlowFinalStep";
import { FlowToast } from "./FlowToast";

interface PropsI {
  stepId: FlowStepIdType;
  frame: FlowFrameType;
  prompt: string;
}

/**
 * FlowPreviewStage
 *
 * Renders the active step's screen for the current frame, plus any toast.
 */
export function FlowPreviewStage({ stepId, frame, prompt }: PropsI) {
  const t = useTranslations("home.flowPreview");

  return (
    <>
      {stepId === "upload" && <FlowUploadStep isUploaded={frame.isUploaded} />}
      {stepId === "describe" && (
        <FlowDescribeStep
          prompt={prompt}
          typedCount={frame.typedCount}
          isPromptComplete={frame.isPromptComplete}
        />
      )}
      {stepId === "process" && (
        <FlowGeneratingStep
          tone="dark"
          icon={Sparkles}
          title={t("process.title")}
          eta={t("process.eta")}
          progressPct={frame.progressPct}
        />
      )}
      {stepId === "results" && <FlowResultsStep isUseHighlighted={frame.isUseHighlighted} />}
      {stepId === "product" && <FlowProductStep isTeeSelected={frame.isTeeSelected} />}
      {stepId === "customize" && (
        <FlowCustomizeStep printSize={frame.printSize} rotationIndex={frame.rotationIndex} />
      )}
      {stepId === "creation" && (
        <FlowGeneratingStep
          tone="light"
          icon={Package}
          title={t("creation.title")}
          eta={t("creation.eta")}
          progressPct={frame.progressPct}
        />
      )}
      {stepId === "final" && <FlowFinalStep isBagged={frame.isBagged} />}

      {frame.toast && <FlowToast type={frame.toast} />}
    </>
  );
}
