import type { CreatedProductT, UploadImageRequestI } from "@/types/customProduct";

export class CustomProductServiceMapper {
  private static isDataUrl(value: string): boolean {
    return value.startsWith("data:image/");
  }

  /**
   * Map image URL to upload request
   */
  static mapImageUrlToUploadRequest(imageUrl: string): UploadImageRequestI {
    if (this.isDataUrl(imageUrl)) {
      return {
        image_base64: imageUrl,
        file_name: `design-${Date.now()}.png`,
      };
    }

    return {
      image_url: imageUrl,
      file_name: `design-${Date.now()}.png`,
    };
  }

  /**
   * Map created product to product summary
   */
  static mapCreatedProductToSummary(product: CreatedProductT) {
    return {
      id: product.id,
      title: product.title,
      variants: product.variants?.map(v => ({
        id: v.id,
        title: v.title,
        price: v.price,
        isEnabled: v.is_enabled,
      })),
      images: product.images?.map(img => ({
        src: img.src,
        position: img.position,
        isDefault: img.is_default,
      })),
    };
  }

  /**
   * Extract first product image URL
   */
  static extractFirstImageUrl(product: CreatedProductT): string | null {
    return product.images?.[0]?.src || null;
  }

  /**
   * Get enabled variants from product
   */
  static getEnabledVariants(product: CreatedProductT) {
    return product.variants?.filter(v => v.is_enabled) || [];
  }

  /**
   * Get variant by ID
   */
  static getVariantById(product: CreatedProductT, variantId: number) {
    return product.variants?.find(v => v.id === variantId);
  }

  /**
   * Calculate base price from first enabled variant
   */
  static calculateBasePrice(product: CreatedProductT): number {
    const firstEnabledVariant = product.variants?.find(v => v.is_enabled);
    return firstEnabledVariant?.price || 25.0;
  }

  /**
   * Map product to print areas configuration
   */
  static mapProductToPrintAreas(imageId: string, includeBack?: boolean) {
    const printAreas: Record<string, string> = {
      front: imageId,
    };

    if (includeBack) {
      printAreas.back = imageId;
    }

    return printAreas;
  }
}
