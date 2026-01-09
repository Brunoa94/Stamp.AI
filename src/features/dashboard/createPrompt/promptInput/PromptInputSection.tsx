import { theme } from "@/theme";
import { clsx } from "clsx";
import PromptTipBanner from "../components/PromptTipBanner";
import PromptSectionHeader from "../components/PromptSectionHeader";
import PromptInput from "./PromptInput";

interface IPromptInputSectionProps {
  uploadedImage: File | null;
  isProcessing: boolean;
  generatedResult: any;
  onSubmit: (prompt: string) => void;
}

const PromptInputSection = ({
  uploadedImage,
  isProcessing,
  generatedResult,
  onSubmit,
}: IPromptInputSectionProps) => {
  const hasUploadedImage = !!uploadedImage;
  const shouldShowTip = hasUploadedImage;
  const shouldHighlightCard =
    hasUploadedImage && !isProcessing && !generatedResult;

  return (
    <article
      className={clsx(
        theme.prompt.section,
        theme.animations.slideInRight,
        "transition-all duration-700 ease-out",
        !hasUploadedImage ? "opacity-60 scale-95" : "opacity-100 scale-100"
      )}
    >
      <div
        className={clsx(
          theme.prompt.card,
          "transition-all duration-700 ease-out group hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105",
          shouldHighlightCard &&
            "ring-2 ring-blue-300 shadow-xl shadow-blue-500/20 transform scale-102"
        )}
      >
        <PromptSectionHeader hasUploadedImage={hasUploadedImage} />

        {shouldShowTip && <PromptTipBanner />}

        <PromptInput
          onSubmit={onSubmit}
          disabled={!hasUploadedImage}
          isProcessing={isProcessing}
        />
      </div>
    </article>
  );
};

export default PromptInputSection;
