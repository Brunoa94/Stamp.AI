import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";
import type { CreatedProductT } from "@/types/customProduct";
import { ProductServiceMapper, type SavePrintifyProductInput } from "@/mappers/services";
import { ErrorClient } from "./errorClient";

type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductRow = Database['public']['Tables']['products']['Row'];

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

      // Use mapper to convert input to database insert format
      const productData = ProductServiceMapper.mapInputToProductInsert(input);

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
      throw ErrorClient.handleError({error, service: "Product", action: "Save Printify Product"})
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
      throw ErrorClient.handleError({error, service: "Product", action: "Get Product"})
    }
  }

  /**
   * Helper to convert Printify product response to SavePrintifyProductInput
   * Delegates to ProductServiceMapper for the actual mapping logic
   */
  static mapPrintifyProductToInput(
    printifyProduct: CreatedProductT,
    blueprintId: number,
    printProviderId: number,
    printAreas: Record<string, any>,
    userId: string
  ): SavePrintifyProductInput {
    return ProductServiceMapper.mapPrintifyProductToInput(
      printifyProduct,
      blueprintId,
      printProviderId,
      printAreas,
      userId
    );
  }
}
