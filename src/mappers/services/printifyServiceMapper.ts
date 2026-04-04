export interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  blueprint_id: number;
  print_provider_id: number;
  variants: Array<{
    id: number;
    title: string;
    price: number;
    is_enabled: boolean;
  }>;
  images?: Array<{
    src: string;
    variant_ids: number[];
    position: string;
    is_default: boolean;
  }>;
}

export interface PrintifyOrder {
  id: string;
  external_id: string;
  status: string;
  line_items: Array<{
    product_id?: string;
    variant_id: number;
    quantity: number;
    blueprint_id?: number;
    print_provider_id?: number;
    print_areas?: any;
  }>;
  shipping_method: number;
  address_to: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    country: string;
    region: string;
    address1: string;
    address2: string;
    city: string;
    zip: string;
  };
}

export class PrintifyServiceMapper {
  /**
   * Map line item for existing product
   */
  static mapExistingProductLineItem(
    productId: string,
    variantId: number,
    quantity: number = 1
  ) {
    return {
      product_id: productId,
      variant_id: variantId,
      quantity,
    };
  }

  /**
   * Map line item for custom product (on-the-fly creation)
   */
  static mapCustomProductLineItem(
    blueprintId: number,
    printProviderId: number,
    variantId: number,
    printAreas: Record<string, any>,
    quantity: number = 1
  ) {
    return {
      blueprint_id: blueprintId,
      print_provider_id: printProviderId,
      variant_id: variantId,
      print_areas: printAreas,
      quantity,
    };
  }

  /**
   * Map shipping address to Printify format
   */
  static mapShippingAddress(address: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    country?: string;
    region?: string;
    address1?: string;
    address2?: string;
    city?: string;
    zip?: string;
  }) {
    return {
      first_name: address.firstName || 'Customer',
      last_name: address.lastName || '',
      email: address.email || 'noreply@example.com',
      phone: address.phone || '',
      country: address.country || 'US',
      region: address.region || '',
      address1: address.address1 || 'Pending',
      address2: address.address2 || '',
      city: address.city || 'Pending',
      zip: address.zip || '00000',
    };
  }

  /**
   * Map order response to simplified format
   */
  static mapPrintifyOrderToSimple(order: PrintifyOrder) {
    return {
      id: order.id,
      externalId: order.external_id,
      status: order.status,
      itemCount: order.line_items.length,
      totalQuantity: order.line_items.reduce((sum, item) => sum + item.quantity, 0),
      shippingAddress: {
        fullName: `${order.address_to.first_name} ${order.address_to.last_name}`.trim(),
        email: order.address_to.email,
        city: order.address_to.city,
        country: order.address_to.country,
      },
    };
  }

  /**
   * Map print areas for image placement
   */
  static mapPrintAreasForPlacement(
    imageId: string,
    position: 'front' | 'back' = 'front',
    placement?: { x?: number; y?: number; scale?: number; angle?: number }
  ) {
    return {
      position,
      images: [{
        id: imageId,
        x: placement?.x ?? 0.5,
        y: placement?.y ?? 0.5,
        scale: placement?.scale ?? 1,
        angle: placement?.angle ?? 0,
      }],
    };
  }

  /**
   * Extract variant IDs from product
   */
  static extractVariantIds(product: PrintifyProduct): number[] {
    return product.variants.map(v => v.id);
  }

  /**
   * Extract enabled variant IDs from product
   */
  static extractEnabledVariantIds(product: PrintifyProduct): number[] {
    return product.variants.filter(v => v.is_enabled).map(v => v.id);
  }
}
