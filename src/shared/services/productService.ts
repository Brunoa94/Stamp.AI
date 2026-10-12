import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/shared/types/database.types";
import type { CreatedProductT } from "@/shared/types/customProduct";
import { ProductServiceMapper, type SavePrintifyProductInput } from "@/shared/mappers/services/productServiceMapper";
import { ErrorClient } from "./errorClient";

type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductRow = Database['public']['Tables']['products']['Row'];

export class ProductService {
  /**
   * Creates a mock product row for testing purposes
   * @private
   */
  private static createMockProductRow(
    input: Pick<SavePrintifyProductInput, 'printifyProductId'>,
    productData: ProductInsert
  ): ProductRow {
    const fakeId = `mock-${input.printifyProductId}-${Date.now()}`;
    return {
      id: fakeId,
      printify_product_id: input.printifyProductId,
      name: productData.name,
      description: productData.description,
      blueprint_id: productData.blueprint_id,
      print_provider_id: productData.print_provider_id,
      print_areas: productData.print_areas,
      is_active: productData.is_active,
      user_id: productData.user_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as ProductRow;
  }

  private static getSupabase() {
    try {
      return createClient();
    } catch (error) {
      // Only return null in test environments
      // In production, we want to fail fast if DB is unavailable
      if (process.env.NODE_ENV === 'test') {
        console.warn("Supabase client not available in test environment:", error);
        return null;
      }
      throw error;
    }
  }

  /**
   * Save a Printify product to the database
   * This allows us to reference it in carts and orders
   */
  static async savePrintifyProduct(input: SavePrintifyProductInput): Promise<ProductRow> {
    try {
      const supabase = this.getSupabase();

      // The creation endpoint records ownership with its privileged server identity.
      // Browser writes cannot prove ownership of a supplied Printify ID.
      const productData = ProductServiceMapper.mapInputToProductInsert(input);
      if (supabase) {
        const { data: owned, error } = await supabase.from("products").select("*")
          .eq("printify_product_id", input.printifyProductId).eq("user_id", input.userId).single();
        if (error || !owned) throw error ?? new Error("Product ownership could not be verified");
        return owned;
      }

      return this.createMockProductRow(input, productData);
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

      // In test environment without supabase, return null
      if (!supabase) {
        console.warn("Skipping product fetch (no supabase client in test environment)");
        return null;
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle();

      if (error) {
        throw ErrorClient.handleError({ error, service: "Product", action: "Get Product" });
      }

      return data;
    } catch (error) {
      throw ErrorClient.handleError({ error, service: "Product", action: "Get Product" });
    }
  }

  /**
   * Get all custom products for a user
   */
  static async getUserProducts(userId: string): Promise<ProductRow[]> {
    try {
      const supabase = this.getSupabase();

      // In test environment without supabase, return empty array
      if (!supabase) {
        console.warn("Skipping user products fetch (no supabase client in test environment)");
        return [];
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw ErrorClient.handleError({ error, service: "Product", action: "Get User Products" });
      }

      return data || [];
    } catch (error) {
      throw ErrorClient.handleError({ error, service: "Product", action: "Get User Products" });
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
    printAreas: SavePrintifyProductInput["printAreas"],
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
