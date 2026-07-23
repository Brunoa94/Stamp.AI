import type { Database } from "@/types/database.types";
import type { CreatedProductT } from "@/types/customProduct";

type ProductRow = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];

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

export class ProductServiceMapper {
  /**
   * Map Printify product response to database insert input
   */
  static mapPrintifyProductToInput(
    printifyProduct: CreatedProductT,
    blueprintId: number,
    printProviderId: number,
    printAreas: Record<string, any>,
    userId: string
  ): SavePrintifyProductInput {
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

  /**
   * Map SavePrintifyProductInput to database ProductInsert
   */
  static mapInputToProductInsert(input: SavePrintifyProductInput): ProductInsert {
    return {
      printify_product_id: input.printifyProductId,
      name: input.title,
      description: input.description || null,
      blueprint_id: input.blueprintId,
      print_provider_id: input.printProviderId,
      print_areas: input.printAreas as any,
      user_id: input.userId,
      is_active: true,
    };
  }

  /**
   * Map database ProductRow to public-facing product
   */
  static mapProductRowToPublic(product: ProductRow) {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      isActive: product.is_active,
      printifyProductId: product.printify_product_id,
      blueprintId: product.blueprint_id,
      printProviderId: product.print_provider_id,
      printAreas: product.print_areas,
      userId: product.user_id,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    };
  }
}
