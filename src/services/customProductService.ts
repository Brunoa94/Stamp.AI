import {
  CreateProductPayloadT,
  CreatedProductT,
  CreateCustomProductRequestI,
} from "@/types/customProduct";
import {
  CreateProductPayloadSchema,
  UploadImageRequestSchema,
  UploadImageResponseSchema,
  CreateCustomProductRequestSchema,
  CreateCustomProductResponseSchema,
} from "@/schemas/customProduct";
import { CustomProductServiceMapper } from "@/mappers/services/customProductServiceMapper";
import { ProductService } from "./productService";
import { ErrorClient } from "./errorClient";

export class CustomProductService {
  private static getSupabaseConfig() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Do not throw here; caller will fall back to relative functions URLs when
    // environment variables are not present (e.g. during Playwright tests).
    return { supabaseUrl, supabaseAnonKey };
  }

  /**
   * Upload image to Printify
   * Uses CustomProductServiceMapper to create upload request
   */
  static async uploadImage(
    imageUrl: string,
  ): Promise<{ id: string; previewUrl: string }> {
    try {
      const { supabaseUrl, supabaseAnonKey } = this.getSupabaseConfig();

      // Use mapper to create upload request payload
      const payload = CustomProductServiceMapper.mapImageUrlToUploadRequest(imageUrl);

      // Validate request payload
      const validatedPayload = UploadImageRequestSchema.parse(payload);

      const fetchUrl = supabaseUrl
        ? `${supabaseUrl}/functions/v1/upload-printify-image`
        : `/functions/v1/upload-printify-image`;

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (supabaseAnonKey) headers["Authorization"] = `Bearer ${supabaseAnonKey}`;

      const response = await fetch(fetchUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(validatedPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      // Validate response data
      const validatedData = UploadImageResponseSchema.parse(data);

      if (
        !validatedData.success ||
        !validatedData.image?.id ||
        !validatedData.image?.preview_url
      ) {
        throw new Error("Failed to upload image to Printify");
      }

      return {
        id: validatedData.image.id,
        previewUrl: validatedData.image.preview_url,
      };
    } catch (error) {
      throw ErrorClient.handleError({error, service: "Custom Product", action: "Upload Image"})
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
      const uploadedImage = await this.uploadImage(validatedInput.image_url);

      // Step 2: Create custom product
      const productPayload: CreateCustomProductRequestI = {
        blueprint_id: validatedInput.blueprint_id,
        print_provider_id: validatedInput.print_provider_id,
        print_areas: {
          front: uploadedImage.id,
        },
        title: validatedInput.title || `Custom Design ${Date.now()}`,
        description: validatedInput.description || "Custom designed product",
        user_id: validatedInput.user_id,
        customer_email: validatedInput.customer_email,
        selected_color: validatedInput.selected_color,
        selected_size: validatedInput.selected_size,
      };

      // Validate product payload
      const validatedProductPayload = CreateCustomProductRequestSchema.parse(productPayload);

      const fetchUrl = supabaseUrl
        ? `${supabaseUrl}/functions/v1/create-custom-product`
        : `/functions/v1/create-custom-product`;

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (supabaseAnonKey) headers["Authorization"] = `Bearer ${supabaseAnonKey}`;

      const response = await fetch(fetchUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(validatedProductPayload),
      });

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

      // Debug: Log product data to verify images are included
      console.log("🎨 Created product:", JSON.stringify(printifyProduct, null, 2));
      console.log("🖼️ Product images count:", printifyProduct.images?.length);
      console.log("🖼️ First image:", printifyProduct.images?.[0]);

      // Step 3: Save the Printify product to our database
      console.log('💾 Saving Printify product to database...');
      try {
        const productInput = ProductService.mapPrintifyProductToInput(
          printifyProduct,
          validatedInput.blueprint_id,
          validatedInput.print_provider_id,
          { front: uploadedImage.id }, // Store the print areas
          validatedInput.user_id
        );

        await ProductService.savePrintifyProduct(productInput);
        console.log('✅ Printify product saved to database');
      } catch (saveError) {
        console.error('⚠️ Failed to save product to database:', saveError);
        // Don't fail the entire operation - Printify product was created successfully
        // This is a non-critical error that can be retried later
      }

      return {
        ...printifyProduct,
        uploaded_image_preview_url: uploadedImage.previewUrl,
      };
    } catch (error) {
      throw ErrorClient.handleError({error, service: "Custom Product", action: "Create Custom Product"})
    }
  }
}

