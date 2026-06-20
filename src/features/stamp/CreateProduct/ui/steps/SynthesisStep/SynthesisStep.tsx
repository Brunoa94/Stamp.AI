"use client";

import { Controller } from "react-hook-form";
import { WizardPromptInput } from "./components/WizardPromptInput";
import { CreateProductSelectors } from "@/features/stamp/CreateProduct/lib/context/selectors";

export function SynthesisStep() {
  const form = CreateProductSelectors.form();
  const uploadedImage = CreateProductSelectors.uploadedImage();
  const hasUploadedImage = !!uploadedImage;

  if (!form) {
    return null;
  }

  const { control } = form;

  return (
    <div className="h-full flex flex-col justify-center animate-[slideIn_0.5s_ease-out]">
      <Controller
        name="prompt"
        control={control}
        render={({ field: { value, onChange, onBlur } }) => (
          <WizardPromptInput
            value={value || ""}
            onChange={onChange}
            onBlur={onBlur}
            disabled={!hasUploadedImage}
          />
        )}
      />
    </div>
  );
}
