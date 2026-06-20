/**
 * Product creation mappers
 * Maps stamp form data to product creation API payloads
 */

import type { StampFormData } from "../schemas/stampFormSchema";

/**
 * Product creation payload type
 */
export type ProductCreationPayloadType = {
  blueprint_id: number;
  print_provider_id: number;
  image_url: string;
  title: string;
  description: string;
  user_id: string;
  customer_email: string;
  selected_color: string;
  selected_size: string;
};

/**
 * Maps stamp form data to product creation payload
 * @param formData - The stamp form data
 * @param selectedImageUrl - The selected image URL
 * @param enhancedPrompt - The enhanced prompt text
 * @param userId - The user ID
 * @param userEmail - The user email
 * @returns Product creation payload
 */
export function mapToProductCreationPayload(
  formData: StampFormData,
  selectedImageUrl: string,
  enhancedPrompt: string | undefined,
  userId: string,
  userEmail: string,
): ProductCreationPayloadType {
  return {
    blueprint_id: formData.blueprintId!,
    print_provider_id: formData.printProviderId!,
    image_url: selectedImageUrl,
    title: enhancedPrompt || formData.prompt || "Custom Design",
    description: formData.prompt || "Custom AI-generated design",
    user_id: userId,
    customer_email: userEmail,
    selected_color: formData.selectedColor!,
    selected_size: formData.selectedSize!,
  };
}
