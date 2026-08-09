/**
 * Catalog Query Service (Final Simplified Version)
 * Queries for product catalog using blueprint_id as primary key
 */

import { createClient } from "@/lib/supabase/client";
import { ErrorClient } from "./errorClient";

export interface CatalogProduct {
  blueprint_id: number;
  display_title: string;
  base_image_url: string | null;
  min_price_cents: number;
  shipping_cents: number;
  is_active: boolean;
  print_provider_id: number; // Printify print provider ID (default 99)
  selling_price_cents: number | null;
  original_price_cents: number | null;
  is_on_sale: boolean;
  last_synced_at: string | null;
}

export interface ProductVariant {
  blueprint_id: number;
  printify_variant_id: number;
  color: string | null;
  size: string | null;
  price_cents: number;
  is_available: boolean;
}

export interface VariantPrice {
  printifyVariantId: number;
  color: string | null;
  size: string | null;
  priceCents: number;
}

export class CatalogQueryService {
  /**
   * Get all active products
   */
  static async getProducts(): Promise<CatalogProduct[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("catalog_products")
      .select("*")
      .eq("is_active", true)
      .order("display_title");

    if (error) {
      throw ErrorClient.handleError({ error, service: "Catalog", action: "Get Products" });
    }

    return data || [];
  }

  /**
   * Get a single product by blueprint_id
   */
  static async getProduct(blueprintId: number): Promise<CatalogProduct | null> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("catalog_products")
      .select("*")
      .eq("blueprint_id", blueprintId)
      .eq("is_active", true)
      .single();

    if (error) {
      // PGRST116 = "not found" for .single() - return null instead of throwing
      if (error.code === "PGRST116") {
        return null;
      }
      throw ErrorClient.handleError({ error, service: "Catalog", action: "Get Product" });
    }

    return data;
  }

  /**
   * Get variant price for specific color+size
   */
  static async getVariantPrice(
    blueprintId: number,
    color: string,
    size: string
  ): Promise<VariantPrice | null> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("product_variants")
      .select("printify_variant_id, color, size, price_cents")
      .eq("blueprint_id", blueprintId)
      .eq("color", color)
      .eq("size", size)
      .eq("is_available", true)
      .single();

    if (error) {
      // PGRST116 = "not found" for .single() - return null instead of throwing
      if (error.code === "PGRST116") {
        return null;
      }
      throw ErrorClient.handleError({ error, service: "Catalog", action: "Get Variant Price" });
    }

    if (!data) {
      return null;
    }

    return {
      printifyVariantId: data.printify_variant_id,
      color: data.color,
      size: data.size,
      priceCents: data.price_cents,
    };
  }

  /**
   * Get all available colors for a product
   */
  static async getProductColors(blueprintId: number): Promise<string[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("product_variants")
      .select("color")
      .eq("blueprint_id", blueprintId)
      .eq("is_available", true)
      .not("color", "is", null);

    if (error) {
      throw ErrorClient.handleError({ error, service: "Catalog", action: "Get Product Colors" });
    }

    const uniqueColors = [...new Set(data?.map((v) => v.color!).filter(Boolean))];
    return uniqueColors;
  }

  /**
   * Get all available sizes for a product + color
   */
  static async getProductSizes(
    blueprintId: number,
    color: string
  ): Promise<string[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("product_variants")
      .select("size")
      .eq("blueprint_id", blueprintId)
      .eq("color", color)
      .eq("is_available", true)
      .not("size", "is", null);

    if (error) {
      throw ErrorClient.handleError({ error, service: "Catalog", action: "Get Product Sizes" });
    }

    // Sort sizes in standard order
    const sizeOrder: Record<string, number> = {
      XS: 1, S: 2, M: 3, L: 4, XL: 5, "2XL": 6, "3XL": 7, "4XL": 8, "5XL": 9,
    };

    const sizes = data?.map((v) => v.size!).filter(Boolean) || [];
    return sizes.sort((a, b) => (sizeOrder[a] || 99) - (sizeOrder[b] || 99));
  }

  /**
   * Get all variants for a product
   */
  static async getProductVariants(blueprintId: number): Promise<ProductVariant[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("blueprint_id", blueprintId)
      .eq("is_available", true)
      .order("color")
      .order("size");

    if (error) {
      throw ErrorClient.handleError({ error, service: "Catalog", action: "Get Product Variants" });
    }

    return data || [];
  }

  /**
   * Check if a product has any available variants
   */
  static async isProductAvailable(blueprintId: number): Promise<boolean> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("product_variants")
      .select("printify_variant_id")
      .eq("blueprint_id", blueprintId)
      .eq("is_available", true)
      .limit(1)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  }

  /**
   * Check if a specific size is available
   */
  static async hasSizeAvailable(blueprintId: number, size: string): Promise<boolean> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("product_variants")
      .select("printify_variant_id")
      .eq("blueprint_id", blueprintId)
      .eq("size", size)
      .eq("is_available", true)
      .gt("price_cents", 0)
      .limit(1)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  }

  /**
   * Get shipping cost for a product
   */
  static async getProductShipping(blueprintId: number): Promise<number> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("catalog_products")
      .select("shipping_cents")
      .eq("blueprint_id", blueprintId)
      .single();

    if (error || !data) {
      return 0;
    }

    return data.shipping_cents || 0;
  }

  /**
   * Get the display price for a product (selling_price if set, otherwise min_price + shipping)
   */
  static async getDisplayPrice(blueprintId: number): Promise<number> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("catalog_products")
      .select("selling_price_cents, min_price_cents, shipping_cents")
      .eq("blueprint_id", blueprintId)
      .single();

    if (error || !data) {
      return 0;
    }

    if (data.selling_price_cents) {
      return data.selling_price_cents;
    }

    return (data.min_price_cents || 0) + (data.shipping_cents || 0);
  }
}
