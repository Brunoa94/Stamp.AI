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

    try {
      const response = await fetch(fetchUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Edge Function ${functionName} failed: HTTP ${response.status}`;

        // Parse error details if available
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error) {
            errorMessage += `: ${errorJson.error}`;
          } else {
            errorMessage += `: ${errorText}`;
          }
        } catch {
          errorMessage += `: ${errorText}`;
        }

        // Provide specific error messages for common status codes
        if (response.status === 404) {
          throw new Error(
            `Edge Function "${functionName}" not found. Ensure it is deployed.`
          );
        } else if (response.status === 401 || response.status === 403) {
          throw new Error(
            `Authentication failed for Edge Function "${functionName}". Check your Supabase credentials.`
          );
        } else if (response.status === 504 || response.status === 524) {
          throw new Error(
            `Edge Function "${functionName}" timed out. This function may require background execution.`
          );
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          `Network error calling Edge Function "${functionName}". Check your connection and Supabase URL.`
        );
      }
      throw error;
    }
  }

  /**
   * Extract shipping cost for a specific country from shipping profiles
   */
  private static getShippingCostForCountry(
    shippingProfiles: ProviderCatalogEntry["shipping_profiles"] | undefined | null,
    countryCode: string
  ): number {
    if (!shippingProfiles || shippingProfiles.length === 0) {
      console.warn(
        `No shipping profiles available for country: ${countryCode}, using default cost`
      );
      return 600; // Default fallback (6 dollars in cents)
    }

    // Find a profile that includes this country
    for (const profile of shippingProfiles) {
      if (
        profile &&
        profile.countries &&
        Array.isArray(profile.countries) &&
        profile.countries.includes(countryCode)
      ) {
        const cost = profile.first_item?.cost;
        if (typeof cost === "number" && cost >= 0) {
          return cost;
        }
      }
    }

    // Country not found in any profile, use default
    console.warn(
      `Country ${countryCode} not found in shipping profiles, using default cost`
    );
    return 600;
  }

  /**
   * Select the best provider (lowest total cost) for each blueprint and country
   */
  private static selectBestProvidersPerCountry(
    catalogData: ProviderCatalogEntry[],
    countryCode: string
  ): BlueprintWithBestProvider[] {
    // Validate input
    if (!catalogData || !Array.isArray(catalogData) || catalogData.length === 0) {
      console.warn("No catalog data provided to selectBestProvidersPerCountry");
      return [];
    }

    // Group by blueprint_id
    const blueprintGroups = new Map<number, ProviderCatalogEntry[]>();

    for (const entry of catalogData) {
      // Skip entries with invalid data
      if (!entry || typeof entry.blueprint_id !== "number") {
        console.warn("Invalid catalog entry, skipping:", entry);
        continue;
      }

      if (!entry.cache_metadata || typeof entry.cache_metadata.min_price !== "number") {
        console.warn(`Invalid cache_metadata for blueprint ${entry.blueprint_id}, skipping`);
        continue;
      }

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
        const minPrice = p.cache_metadata?.min_price ?? 0;
        const totalCost = minPrice + shippingCost;

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

      // Validate blueprint metadata exists
      const blueprintTitle =
        entry.blueprint_title && typeof entry.blueprint_title === "string"
          ? entry.blueprint_title
          : `Blueprint ${entry.blueprint_id}`;

      const blueprintBrand =
        entry.blueprint_brand && typeof entry.blueprint_brand === "string"
          ? entry.blueprint_brand
          : "Unknown";

      const blueprintModel =
        entry.blueprint_model && typeof entry.blueprint_model === "string"
          ? entry.blueprint_model
          : "";

      const blueprintImages =
        entry.blueprint_images && Array.isArray(entry.blueprint_images)
          ? entry.blueprint_images
          : [];

      const blueprintPrintAreas =
        entry.blueprint_print_areas && Array.isArray(entry.blueprint_print_areas)
          ? entry.blueprint_print_areas
          : [];

      const colorsAvailable =
        entry.cache_metadata?.colors_available &&
        Array.isArray(entry.cache_metadata.colors_available)
          ? entry.cache_metadata.colors_available
          : [];

      const sizesAvailable =
        entry.cache_metadata?.sizes_available &&
        Array.isArray(entry.cache_metadata.sizes_available)
          ? entry.cache_metadata.sizes_available
          : [];

      const variantsCount =
        typeof entry.cache_metadata?.variants_count === "number"
          ? entry.cache_metadata.variants_count
          : 0;

      results.push({
        blueprintId: entry.blueprint_id,
        providerId: entry.provider_id,
        providerName: entry.provider_name || "Unknown Provider",
        title: blueprintTitle,
        brand: blueprintBrand,
        model: blueprintModel,
        images: blueprintImages,
        printAreas: blueprintPrintAreas,
        minPrice: entry.cache_metadata.min_price,
        shippingCost: cheapest.shippingCost,
        totalCost: cheapest.totalCost,
        colorsAvailable,
        sizesAvailable,
        variantsCount,
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
    if (!bestProviders || !Array.isArray(bestProviders)) {
      console.warn("Invalid bestProviders data in transformToTshirtType");
      return [];
    }

    return bestProviders.map((bp) => {
      const description = `${bp.brand} ${bp.model}`.trim();
      const primaryImage = bp.images && bp.images.length > 0 ? bp.images[0] : "/api/placeholder/200/200";
      const features = bp.printAreas && Array.isArray(bp.printAreas)
        ? bp.printAreas.map((area) => area.position).filter(Boolean)
        : [];

      return {
        id: `blueprint-${bp.blueprintId}`,
        name: bp.title || `Product ${bp.blueprintId}`,
        description: description || bp.title,
        image: primaryImage,
        images: bp.images || [],
        features,
        price: bp.totalCost / 100, // Convert cents to dollars
        material: bp.brand || "Cotton",
        fit: "Classic",
        blueprint_id: bp.blueprintId,
        print_provider_id: bp.providerId,
        brand: bp.brand,
        model: bp.model,
      };
    });
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
      // Validate country code
      if (!countryCode || typeof countryCode !== "string") {
        throw new Error("Country code must be a non-empty string");
      }

      const normalizedCountryCode = countryCode.trim().toUpperCase();

      if (normalizedCountryCode.length !== 2) {
        throw new Error(
          `Invalid country code: "${countryCode}". Must be a 2-letter ISO country code (e.g., 'NL', 'US', 'GB')`
        );
      }

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
        normalizedCountryCode
      );

      console.log(
        `✅ Selected ${bestProviders.length} best providers for country: ${normalizedCountryCode}`
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
      // Validate input
      if (!blueprintIds || !Array.isArray(blueprintIds) || blueprintIds.length === 0) {
        console.warn("Invalid blueprintIds provided to hasCachedCatalog");
        return false;
      }

      // Validate all blueprint IDs are numbers
      if (!blueprintIds.every((id) => typeof id === "number" && id > 0)) {
        console.warn("Invalid blueprint ID in array:", blueprintIds);
        return false;
      }

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
