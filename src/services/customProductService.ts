import { CreateCustomProductRequestI, UploadImageRequestI, UploadImageResponseI } from "@/shared-types";

export interface CreateProductPayload {
  blueprint_id: number;
  print_provider_id: number;
  image_url: string;
  title?: string;
  description?: string;
}

export interface CreatedProduct {
  id: string;
  title: string;
  variants: Array<{
    id: number;
    title: string;
    price: number;
    is_enabled: boolean;
  }>;
  images?: Array<{
    src: string;
    position: string;
    is_default: boolean;
  }>;
}

export class CustomProductService {
  private static supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  private static supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  /**
   * Upload image to Printify
   */
  static async uploadImage(imageUrl: string): Promise<string> {
    try {
      if (!this.supabaseUrl || !this.supabaseAnonKey) {
        throw new Error("Supabase configuration missing");
      }

      const payload: UploadImageRequestI = {
        image_url: imageUrl,
        file_name: `design-${Date.now()}.png`,
      };

      const response = await fetch(
        `${this.supabaseUrl}/functions/v1/upload-printify-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.supabaseAnonKey}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data: UploadImageResponseI = await response.json();

      if (!data.success || !data.image?.id) {
        throw new Error("Failed to upload image to Printify");
      }

      return data.image.id;
    } catch (error) {
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
    payload: CreateProductPayload
  ): Promise<CreatedProduct> {
    try {
      if (!this.supabaseUrl || !this.supabaseAnonKey) {
        throw new Error("Supabase configuration missing");
      }

      // Step 1: Upload image to Printify
      console.log("Uploading image to Printify...");
      const imageId = await this.uploadImage(payload.image_url);
      console.log("Image uploaded with ID:", imageId);

      // Step 2: Create custom product
      console.log("Creating custom product...");
      const productPayload: CreateCustomProductRequestI = {
        blueprint_id: payload.blueprint_id,
        print_provider_id: payload.print_provider_id,
        print_areas: {
          front: imageId,
        },
        title: payload.title || `Custom Design ${Date.now()}`,
        description: payload.description || "Custom designed product",
      };

      const response = await fetch(
        `${this.supabaseUrl}/functions/v1/create-custom-product`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.supabaseAnonKey}`,
          },
          body: JSON.stringify(productPayload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (!data.success || !data.product) {
        throw new Error(data.error || "Failed to create custom product");
      }

      return data.product;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Product creation failed: ${error.message}`);
      }
      throw new Error("Product creation failed: Unknown error occurred");
    }
  }
}
