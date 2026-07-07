import { ChangeEvent } from "react";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { Button } from "@/features/ui/button";
import { PromptInput } from "./PromptInput";
import { ArtStyleSelect } from "./ArtStyleSelect";
import { PreservationSlider } from "./PreservationSlider";

/**
 * SynthesisForm
 *
 * Right panel form with all synthesis controls
 */

interface PropsI {
  prompt: string;
  artStyle: string;
  preservation: number;
  maxPromptLength: number;
  isGenerating: boolean;
  onPromptChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onArtStyleChange: (value: string) => void;
  onPreservationChange: (value: number) => void;
  onGenerate: () => void;
}

export function SynthesisForm({
  prompt,
  artStyle,
  preservation,
  maxPromptLength,
  isGenerating,
  onPromptChange,
  onArtStyleChange,
  onPreservationChange,
  onGenerate,
}: PropsI) {
  return (
    <div className="p-12 lg:p-24 flex flex-col justify-center bg-white">
      <Span variant="sm" className="text-(--color-stamp-taupe) mb-6">
        Protocol 02 / Logic
      </Span>

      <Heading
        as="h2"
        variant="title"
        className="text-(--color-stamp-chocolate) mb-6"
      >
        Descriptive{" "}
        <span className="font-serif italic lowercase font-light text-(--color-stamp-taupe)">
          Synthesis
        </span>
      </Heading>

      {/* Form Fields */}
      <div className="space-y-8 mb-12">
        <PromptInput
          value={prompt}
          onChange={onPromptChange}
          maxLength={maxPromptLength}
        />

        <div className="grid grid-cols-2 gap-8">
          <ArtStyleSelect value={artStyle} onChange={onArtStyleChange} />
          <PreservationSlider
            value={preservation}
            onChange={onPreservationChange}
          />
        </div>
      </div>

      {/* Generate Button */}
      <div>
        <Button
          onClick={onGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full bg-(--color-stamp-chocolate) text-white hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) transition-all duration-300 px-8 py-6 text-xs font-bold tracking-[0.2em] uppercase disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? "GENERATING..." : "STAMP IT!"}
        </Button>
      </div>
    </div>
  );
}
