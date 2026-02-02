import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  imageGenerationSchema,
  IImageGenerationForm,
} from "@/schemas/imageGenerationSchema";

export const useImageGenerationForm = () => {
  const form = useForm<IImageGenerationForm>({
    resolver: zodResolver(imageGenerationSchema),
    mode: "onChange",
    defaultValues: {
      image: undefined,
      prompt: "",
    },
  });

  const handleRemoveImage = () => {
    form.setValue("image", undefined as any);
  };

  return {
    form,
    handleRemoveImage,
  };
};