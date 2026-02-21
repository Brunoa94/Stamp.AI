import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";
import type { CreatedProductT } from "@/types/customProduct";

type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductRow = Database['public']['Tables']['products']['Row'];

export interface SavePrintifyProductInput {
  printifyProductId: string;
  title: string;
  description?: string;
  blueprintId: number;
  printProviderId: number;
  printAreas: Record<string, any>;
  basePrice: number;
  userId: string;
  variants?: Array<{
    id: number;
    title: string;
    price: number;
    is_enabled: boolean;
  }>;
}

export class ProductService {
  private static getSupabase() {
    return createClient();
  }

  /**
   * Save a Printify product to the database
   * This allows us to reference it in carts and orders
   */
  static async savePrintifyProduct(input: SavePrintifyProductInput): Promise<ProductRow> {
    try {
      const supabase = this.getSupabase();

      // Generate a slug from userId and printifyProductId
      const slug = `${input.userId}-${input.printifyProductId}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Check if product already exists with this Printify ID
      const { data: existingProduct } = await supabase
        .from('products')
        .select('*')
        .eq('printify_product_id', input.printifyProductId)
        .maybeSingle();

      if (existingProduct) {
        console.log('✅ Product already exists in database:', existingProduct.id);
        return existingProduct;
      }

      // Create the product record
      const productData: ProductInsert = {
        printify_product_id: input.printifyProductId, // Store Printify product ID
        name: input.title,
        slug: slug,
        description: input.description || null,
        base_price: input.basePrice,
        blueprint_id: input.blueprintId,
        print_provider_id: input.printProviderId,
        print_areas: input.printAreas as any, // JSON type
        is_active: true,
        is_featured: false,
        currency: 'USD',
      };

      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned after product creation');
      }

      console.log('✅ Saved Printify product to database:', data.id);
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to save Printify product: ${error.message}`);
      }
      throw new Error('Failed to save Printify product: Unknown error');
    }
  }

  /**
   * Get a product by ID
   */
  static async getProduct(productId: string): Promise<ProductRow | null> {
    try {
      const supabase = this.getSupabase();

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle();

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get product: ${error.message}`);
      }
      throw new Error('Failed to get product: Unknown error');
    }
  }

  /**
   * Helper to convert Printify product response to SavePrintifyProductInput
   */
  static mapPrintifyProductToInput(
    printifyProduct: CreatedProductT,
    blueprintId: number,
    printProviderId: number,
    printAreas: Record<string, any>,
    userId: string
  ): SavePrintifyProductInput {
    // Calculate base price from the first enabled variant
    const firstEnabledVariant = printifyProduct.variants?.find(v => v.is_enabled);
    const basePrice = firstEnabledVariant?.price || 25.0;

    return {
      printifyProductId: printifyProduct.id,
      title: printifyProduct.title,
      description: `Custom designed product with unique artwork`,
      blueprintId,
      printProviderId,
      printAreas,
      basePrice,
      userId,
      variants: printifyProduct.variants,
    };
  }
}
