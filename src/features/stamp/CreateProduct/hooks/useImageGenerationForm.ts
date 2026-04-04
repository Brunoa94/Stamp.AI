import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productCreateSchema,
  IProductCreateForm,
} from "@/schemas/productCreateSchema";

export const useImageGenerationForm = () => {
  const form = useForm<IProductCreateForm>({
    resolver: zodResolver(productCreateSchema),
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