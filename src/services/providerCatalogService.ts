import { createClient } from "@/lib/supabase/client";
import { TshirtType } from "@/types/product";
import { ErrorClient } from "./errorClient";

// Curated blueprint IDs matching the Edge Function
const CURATED_BLUEPRINT_IDS = [12, 6, 145, 157, 553];

interface ProviderCatalogEntry {
  id: string;
  blueprint_id: number;
  provider_id: number;
  provider_name: string;
  provider_location: string;
  variants_data: Array<{
    id: number;
    title: string;
    price: number;
    is_enabled: boolean;
    options: {
      color?: string;
      size?: string;
    };
  }>;
  shipping_profiles: Array<{
    variant_ids: number[];
    first_item: { cost: number };
    additional_items: { cost: number };
    countries: string[];
  }>;
  cache_metadata: {
    variants_count: number;
    colors_available: string[];
    sizes_available: string[];
    min_price: number;
    max_price: number;
  };
  fetched_at: string;
  expires_at: string;
  // Blueprint metadata (will be added in migration)
  blueprint_title?: string;
  blueprint_brand?: string;
  blueprint_model?: string;
  blueprint_images?: string[];
  blueprint_print_areas?: Array<{
    position: string;
    width: number;
    height: number;
  }>;
}

interface BlueprintWithBestProvider {
  blueprintId: number;
  providerId: number;
  providerName: string;
  title: string;
  brand: string;
  model: string;
  images: string[];
  printAreas: Array<{ position: string; width: number; height: number }>;
  minPrice: number;
  shippingCost: number;
  totalCost: number;
  colorsAvailable: string[];
  sizesAvailable: string[];
  variantsCount: number;
}

/**
 * Service for interacting with the provider_catalog table
 * Provides cached product catalog data with multi-country support
 */
export class ProviderCatalogService {
  /**
   * Get the Supabase client for database queries
   */
  private static getSupabase() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Return null if environment variables not available (test environment)
    if (!supabaseUrl || !supabaseAnonKey) {
      return null;
    }

    return createClient();
  }

  /**
   * Get the Supabase URL for Edge Function calls
   */
  private static getSupabaseUrl(): string {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return supabaseUrl || "";
  }

  /**
   * Get the Supabase anon key for authorization
   */
  private static getSupabaseAnonKey(): string {
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return supabaseAnonKey || "";
  }

  /**
   * Call an Edge Function
   */
  private static async callEdgeFunction<T>(
    functionName: string,
    body: any = {}
  ): Promise<T> {
    const supabaseUrl = this.getSupabaseUrl();
    const supabaseAnonKey = this.getSupabaseAnonKey();

    // If NEXT_PUBLIC_SUPABASE_URL is not provided (e.g. local test runs),
    // fall back to a relative functions URL so Playwright route handlers
    // can intercept requests.
    const fetchUrl = supabaseUrl
      ? `${supabaseUrl}/functions/v1/${functionName}`
      : `/functions/v1/${functionName}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (supabaseAnonKey) {
      headers["Authorization"] = `Bearer ${supabaseAnonKey}`;
    }

    const response = await fetch(fetchUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Edge Function ${functionName} failed: HTTP ${response.status}: ${errorText}`
      );
    }

    return await response.json();
  }

  /**
   * Extract shipping cost for a specific country from shipping profiles
   */
  private static getShippingCostForCountry(
    shippingProfiles: ProviderCatalogEntry["shipping_profiles"],
    countryCode: string
  ): number {
    if (!shippingProfiles || shippingProfiles.length === 0) {
      return 600; // Default fallback (6 dollars in cents)
    }

    // Find a profile that includes this country
    for (const profile of shippingProfiles) {
      if (profile.countries && profile.countries.includes(countryCode)) {
        return profile.first_item?.cost || 0;
      }
    }

    // Country not found in any profile, use default
    return 600;
  }

  /**
   * Select the best provider (lowest total cost) for each blueprint and country
   */
  private static selectBestProvidersPerCountry(
    catalogData: ProviderCatalogEntry[],
    countryCode: string
  ): BlueprintWithBestProvider[] {
    // Group by blueprint_id
    const blueprintGroups = new Map<number, ProviderCatalogEntry[]>();

    for (const entry of catalogData) {
      if (!blueprintGroups.has(entry.blueprint_id)) {
        blueprintGroups.set(entry.blueprint_id, []);
      }
      blueprintGroups.get(entry.blueprint_id)!.push(entry);
    }

    const results: BlueprintWithBestProvider[] = [];

    // For each blueprint, find the cheapest provider for this country
    for (const [blueprintId, providers] of blueprintGroups) {
      const providersWithCosts = providers.map((p) => {
        const shippingCost = this.getShippingCostForCountry(
          p.shipping_profiles,
          countryCode
        );
        const totalCost = p.cache_metadata.min_price + shippingCost;

        return {
          entry: p,
          shippingCost,
          totalCost,
        };
      });

      // Sort by total cost and pick the cheapest
      providersWithCosts.sort((a, b) => a.totalCost - b.totalCost);
      const cheapest = providersWithCosts[0];

      if (!cheapest) continue;

      const entry = cheapest.entry;

      results.push({
        blueprintId: entry.blueprint_id,
        providerId: entry.provider_id,
        providerName: entry.provider_name,
        title: entry.blueprint_title || `Blueprint ${entry.blueprint_id}`,
        brand: entry.blueprint_brand || "Unknown",
        model: entry.blueprint_model || "",
        images: entry.blueprint_images || [],
        printAreas: entry.blueprint_print_areas || [],
        minPrice: entry.cache_metadata.min_price,
        shippingCost: cheapest.shippingCost,
        totalCost: cheapest.totalCost,
        colorsAvailable: entry.cache_metadata.colors_available || [],
        sizesAvailable: entry.cache_metadata.sizes_available || [],
        variantsCount: entry.cache_metadata.variants_count || 0,
      });
    }

    // Sort by total cost and return top 4 (matching current UX)
    return results.sort((a, b) => a.totalCost - b.totalCost).slice(0, 4);
  }

  /**
   * Transform BlueprintWithBestProvider to TshirtType format
   */
  private static transformToTshirtType(
    bestProviders: BlueprintWithBestProvider[]
  ): TshirtType[] {
    return bestProviders.map((bp) => ({
      id: `blueprint-${bp.blueprintId}`,
      name: bp.title,
      description: `${bp.brand} ${bp.model}`.trim() || bp.title,
      image: bp.images[0] || "/api/placeholder/200/200",
      images: bp.images,
      features: bp.printAreas.map((area) => area.position),
      price: bp.totalCost / 100, // Convert cents to dollars
      material: bp.brand || "Cotton",
      fit: "Classic",
      blueprint_id: bp.blueprintId,
      print_provider_id: bp.providerId,
      brand: bp.brand,
      model: bp.model,
    }));
  }

  /**
   * Get cached product catalog from provider_catalog table
   * Returns the 4 cheapest products for the specified country
   *
   * @param countryCode - ISO country code (e.g., 'NL', 'US', 'GB')
   * @returns Array of TshirtType products with country-specific pricing
   */
  static async getCachedCatalog(
    countryCode: string = "NL"
  ): Promise<TshirtType[]> {
    try {
      const response = await this.callEdgeFunction<{
        success: boolean;
        data?: ProviderCatalogEntry[];
        error?: string;
        cache_miss?: boolean;
      }>("get-provider-catalog", {
        blueprint_ids: CURATED_BLUEPRINT_IDS,
      });

      if (!response.success || !response.data || response.data.length === 0) {
        if (response.cache_miss) {
          console.log("⚠️ Provider catalog cache miss - needs refresh");
          return [];
        }
        throw new Error(response.error || "No catalog data available");
      }

      console.log(
        `✅ Retrieved ${response.data.length} catalog entries from provider_catalog`
      );

      // Select best provider per blueprint for this country
      const bestProviders = this.selectBestProvidersPerCountry(
        response.data,
        countryCode
      );

      console.log(
        `✅ Selected ${bestProviders.length} best providers for country: ${countryCode}`
      );

      // Transform to TshirtType format
      return this.transformToTshirtType(bestProviders);
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "ProviderCatalog",
        action: "Get Cached Catalog",
      });
    }
  }

  /**
   * Manually trigger a refresh of the provider catalog
   * Calls the fetch-provider-catalog Edge Function
   */
  static async refreshCatalog(): Promise<void> {
    try {
      console.log("🔄 Triggering provider catalog refresh...");

      const response = await this.callEdgeFunction<{
        success: boolean;
        summary?: {
          blueprints_processed: number;
          providers_found: number;
          entries_cached: number;
          cache_duration_hours: number;
        };
        error?: string;
      }>("fetch-provider-catalog", {});

      if (!response.success) {
        throw new Error(response.error || "Catalog refresh failed");
      }

      console.log("✅ Provider catalog refreshed successfully");
      console.log("Summary:", response.summary);
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "ProviderCatalog",
        action: "Refresh Catalog",
      });
    }
  }

  /**
   * Check if the catalog cache is valid for the specified blueprints
   * Uses the database helper function has_valid_catalog_cache()
   *
   * @param blueprintIds - Array of blueprint IDs to check
   * @returns true if cache is valid (not expired) for all blueprints
   */
  static async hasCachedCatalog(
    blueprintIds: number[] = CURATED_BLUEPRINT_IDS
  ): Promise<boolean> {
    try {
      const supabase = this.getSupabase();

      if (!supabase) {
        console.warn("Supabase client not available");
        return false;
      }

      // Call the database function
      const { data, error } = await supabase.rpc("has_valid_catalog_cache", {
        p_blueprint_ids: blueprintIds,
      });

      if (error) {
        console.error("Error checking catalog cache:", error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error("Error checking catalog cache:", error);
      return false;
    }
  }
}
