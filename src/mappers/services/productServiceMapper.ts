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
    const slug = `${input.userId}-${input.printifyProductId}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return {
      printify_product_id: input.printifyProductId,
      name: input.title,
      slug: slug,
      description: input.description || null,
      base_price: input.basePrice,
      blueprint_id: input.blueprintId,
      print_provider_id: input.printProviderId,
      print_areas: input.printAreas as any,
      is_active: true,
      is_featured: false,
      currency: 'USD',
    };
  }

  /**
   * Map database ProductRow to public-facing product
   */
  static mapProductRowToPublic(product: ProductRow) {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      basePrice: product.base_price,
      currency: product.currency,
      isActive: product.is_active,
      isFeatured: product.is_featured,
      printifyProductId: product.printify_product_id,
      blueprintId: product.blueprint_id,
      printProviderId: product.print_provider_id,
      printAreas: product.print_areas,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    };
  }
}
