"use client";

import { Controller } from "react-hook-form";
import { WizardUploadArea } from "../../components/WizardUploadArea";
import { CreateProductSelectors } from "../../context/selectors";
import { useCreateProductSubscriberActions } from "../../context/actions";

export function UploadStep() {
  const form = CreateProductSelectors.form();
  const { handleRemoveImage } = useCreateProductSubscriberActions();

  if (!form) {
    return null;
  }

  const { control } = form;

  return (
    <div className="h-full flex flex-col animate-[slideIn_0.5s_ease-out]">
      <Controller
        name="image"
        control={control}
        render={({ field: { onChange, value } }) => (
          <WizardUploadArea
            onImageUpload={onChange}
            uploadedImage={value}
            onRemoveImage={handleRemoveImage}
          />
        )}
      />
    </div>
  );
}
