/**
 * Catalog Query Service
 * Fast queries for product catalog browsing with immediate price lookups
 */

import { createClient } from "@/lib/supabase/client";
import type {
  CatalogProduct,
  ProviderWithPricing,
  VariantPrice,
  CheapestProvider,
} from "@/types/catalog";

export class CatalogQueryService {
  /**
   * Get all products in catalog
   */
  static async getProducts(category?: string): Promise<CatalogProduct[]> {
    const supabase = createClient();

    let query = supabase
      .from("catalog_products")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (category) {
      query = query.eq("category_id", category);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching catalog products:", error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get a single product by ID
   */
  static async getProduct(productId: string): Promise<CatalogProduct | null> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("catalog_products")
      .select("*")
      .eq("id", productId)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
      return null;
    }

    return data;
  }

  /**
   * Get a product by blueprint ID
   */
  static async getProductByBlueprint(
    blueprintId: number
  ): Promise<CatalogProduct | null> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("catalog_products")
      .select("*")
      .eq("blueprint_id", blueprintId)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching product by blueprint:", error);
      return null;
    }

    return data;
  }

  /**
   * Get providers for a product in a specific country
   * Returns: Array of providers with pricing, sorted by price (cheapest first)
   */
  static async getProvidersForProduct(
    productId: string,
    countryCode: string
  ): Promise<ProviderWithPricing[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("product_provider_availability")
      .select(
        `
        print_provider_id,
        base_price_cents,
        currency_code,
        shipping_cost_cents,
        production_time_days,
        print_providers (
          id,
          name,
          description
        )
      `
      )
      .eq("product_id", productId)
      .eq("country_code", countryCode)
      .eq("is_available", true)
      .order("base_price_cents", { ascending: true });

    if (error) {
      console.error("Error fetching providers:", error);
      throw error;
    }

    return (
      data?.map((item: any) => ({
        id: item.print_provider_id,
        name: item.print_providers.name,
        description: item.print_providers.description,
        basePriceCents: item.base_price_cents,
        currencyCode: item.currency_code,
        shippingCostCents: item.shipping_cost_cents,
        productionTimeDays: item.production_time_days,
      })) || []
    );
  }

  /**
   * Get variant pricing for specific configuration
   * Returns immediate price without API call
   */
  static async getVariantPrice(
    productId: string,
    color: string,
    size: string,
    providerId: number,
    countryCode: string
  ): Promise<VariantPrice | null> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("product_variants")
      .select(
        `
        id,
        color,
        size,
        title,
        variant_pricing!inner (
          price_cents,
          cost_cents,
          currency_code,
          is_available
        )
      `
      )
      .eq("product_id", productId)
      .eq("color", color)
      .eq("size", size)
      .eq("variant_pricing.print_provider_id", providerId)
      .eq("variant_pricing.country_code", countryCode)
      .eq("variant_pricing.is_available", true)
      .single();

    if (error) {
      console.error("Error fetching variant price:", error);
      return null;
    }

    if (!data || !data.variant_pricing || data.variant_pricing.length === 0) {
      return null;
    }

    return {
      variantId: data.id,
      color: data.color,
      size: data.size,
      title: data.title,
      priceCents: data.variant_pricing[0].price_cents,
      costCents: data.variant_pricing[0].cost_cents,
      currencyCode: data.variant_pricing[0].currency_code,
    };
  }

  /**
   * Get all available colors for a product
   */
  static async getProductColors(productId: string): Promise<string[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("product_variants")
      .select("color")
      .eq("product_id", productId)
      .not("color", "is", null);

    if (error) {
      console.error("Error fetching product colors:", error);
      return [];
    }

    // Get unique colors
    const uniqueColors = [...new Set(data?.map((v) => v.color!).filter(Boolean))];
    return uniqueColors;
  }

  /**
   * Get all available sizes for a product + color
   */
  static async getProductSizes(
    productId: string,
    color: string
  ): Promise<string[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("product_variants")
      .select("size")
      .eq("product_id", productId)
      .eq("color", color)
      .not("size", "is", null);

    if (error) {
      console.error("Error fetching product sizes:", error);
      return [];
    }

    return data?.map((v) => v.size!).filter(Boolean) || [];
  }

  /**
   * Get all variants for a product
   */
  static async getProductVariants(productId: string) {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", productId)
      .order("color")
      .order("size");

    if (error) {
      console.error("Error fetching product variants:", error);
      return [];
    }

    return data || [];
  }

  /**
   * Get cheapest provider for a specific product variant
   */
  static async getCheapestProvider(
    productId: string,
    color: string,
    size: string,
    countryCode: string
  ): Promise<CheapestProvider | null> {
    const supabase = createClient();

    // Use RPC function for complex query
    const { data, error } = await supabase.rpc("get_cheapest_provider", {
      p_product_id: productId,
      p_color: color,
      p_size: size,
      p_country_code: countryCode,
    });

    if (error) {
      console.error("Error fetching cheapest provider:", error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    return {
      providerName: data[0].provider_name,
      priceCents: data[0].price_cents,
      shippingCostCents: data[0].shipping_cost_cents,
      totalCents: data[0].total_cents,
    };
  }

  /**
   * Check if a product has variants available in a country
   */
  static async isProductAvailableInCountry(
    productId: string,
    countryCode: string
  ): Promise<boolean> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("product_provider_availability")
      .select("id")
      .eq("product_id", productId)
      .eq("country_code", countryCode)
      .eq("is_available", true)
      .limit(1)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  }

  /**
   * Get variant by ID with pricing for specific provider/country
   */
  static async getVariantById(
    variantId: string,
    providerId: number,
    countryCode: string
  ): Promise<VariantPrice | null> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("product_variants")
      .select(
        `
        id,
        color,
        size,
        title,
        variant_pricing!inner (
          price_cents,
          cost_cents,
          currency_code,
          is_available
        )
      `
      )
      .eq("id", variantId)
      .eq("variant_pricing.print_provider_id", providerId)
      .eq("variant_pricing.country_code", countryCode)
      .eq("variant_pricing.is_available", true)
      .single();

    if (error) {
      console.error("Error fetching variant by ID:", error);
      return null;
    }

    if (!data || !data.variant_pricing || data.variant_pricing.length === 0) {
      return null;
    }

    return {
      variantId: data.id,
      color: data.color,
      size: data.size,
      title: data.title,
      priceCents: data.variant_pricing[0].price_cents,
      costCents: data.variant_pricing[0].cost_cents,
      currencyCode: data.variant_pricing[0].currency_code,
    };
  }
}
