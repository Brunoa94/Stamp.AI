import {
  CreateProductPayloadT,
  CreatedProductT,
  CreateCustomProductRequestI,
  UploadImageRequestI,
} from "@/types/customProduct";
import {
  CreateProductPayloadSchema,
  UploadImageRequestSchema,
  UploadImageResponseSchema,
  CreateCustomProductRequestSchema,
  CreateCustomProductResponseSchema,
} from "@/schemas/customProduct";
import { z } from "zod";
import { ProductService } from "./productService";

export class CustomProductService {
  private static getSupabaseConfig() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase configuration missing");
    }

    return { supabaseUrl, supabaseAnonKey };
  }

  /**
   * Upload image to Printify
   */
  static async uploadImage(imageUrl: string): Promise<string> {
    try {
      const { supabaseUrl, supabaseAnonKey } = this.getSupabaseConfig();

      const payload: UploadImageRequestI = {
        image_url: imageUrl,
        file_name: `design-${Date.now()}.png`,
      };

      // Validate request payload
      const validatedPayload = UploadImageRequestSchema.parse(payload);

      const response = await fetch(
        `${supabaseUrl}/functions/v1/upload-printify-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify(validatedPayload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      // Validate response data
      const validatedData = UploadImageResponseSchema.parse(data);

      if (!validatedData.success || !validatedData.image?.id) {
        throw new Error("Failed to upload image to Printify");
      }

      return validatedData.image.id;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Image upload validation failed: ${error.message}`);
      }
      if (error instanceof Error) {
        throw new Error(`Image upload failed: ${error.message}`);
      }
      throw new Error("Image upload failed: Unknown error occurred");
    }
  }

  /**
   * Create custom product with uploaded image
   */
  static async createCustomProduct(
    payload: CreateProductPayloadT
  ): Promise<CreatedProductT> {
    try {
      const { supabaseUrl, supabaseAnonKey } = this.getSupabaseConfig();

      // Validate input payload
      const validatedInput = CreateProductPayloadSchema.parse(payload);

      // Step 1: Upload image to Printify
      const imageId = await this.uploadImage(validatedInput.image_url);

      // Step 2: Create custom product
      const productPayload: CreateCustomProductRequestI = {
        blueprint_id: validatedInput.blueprint_id,
        print_provider_id: validatedInput.print_provider_id,
        print_areas: {
          front: imageId,
        },
        title: validatedInput.title || `Custom Design ${Date.now()}`,
        description: validatedInput.description || "Custom designed product",
        user_id: validatedInput.user_id,
        customer_email: validatedInput.customer_email
      };

      // Validate product payload
      const validatedProductPayload = CreateCustomProductRequestSchema.parse(productPayload);

      const response = await fetch(
        `${supabaseUrl}/functions/v1/create-custom-product`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify(validatedProductPayload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      // Validate response data
      const validatedResponse = CreateCustomProductResponseSchema.parse(data);

      if (!validatedResponse.success || !validatedResponse.product) {
        throw new Error(validatedResponse.error || "Failed to create custom product");
      }

      const printifyProduct = validatedResponse.product;

      // Step 3: Save the Printify product to our database
      console.log('💾 Saving Printify product to database...');
      try {
        const productInput = ProductService.mapPrintifyProductToInput(
          printifyProduct,
          validatedInput.blueprint_id,
          validatedInput.print_provider_id,
          { front: imageId }, // Store the print areas
          validatedInput.user_id
        );

        await ProductService.savePrintifyProduct(productInput);
        console.log('✅ Printify product saved to database');
      } catch (saveError) {
        console.error('⚠️ Failed to save product to database:', saveError);
        // Don't fail the entire operation - Printify product was created successfully
        // This is a non-critical error that can be retried later
      }

      return printifyProduct;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Product creation validation failed: ${error.message}`);
      }
      if (error instanceof Error) {
        throw new Error(`Product creation failed: ${error.message}`);
      }
      throw new Error("Product creation failed: Unknown error occurred");
    }
  }
}

