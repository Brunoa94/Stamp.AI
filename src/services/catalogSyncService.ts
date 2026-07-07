/**
 * Catalog Sync Service
 * Syncs Printify catalog to local database for immediate price lookups
 */

import type {
  CatalogProduct,
  PrintProvider,
  PrintifyBlueprint,
  PrintifyVariant,
  PrintifyProvider,
  PrintifyShippingInfo,
  SyncResult,
  SyncOptions,
} from "@/types/catalog";

const PRINTIFY_API_BASE = "https://api.printify.com/v1";

export class CatalogSyncService {
  private shopId: string;
  private apiToken: string;
  private supabaseUrl: string;
  private supabaseKey: string;

  constructor(
    shopId: string,
    apiToken: string,
    supabaseUrl: string,
    supabaseKey: string
  ) {
    this.shopId = shopId;
    this.apiToken = apiToken;
    this.supabaseUrl = supabaseUrl;
    this.supabaseKey = supabaseKey;
  }

  /**
   * Sync all products from Printify catalog to local database
   */
  async syncCatalog(options: SyncOptions): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      productsCreated: 0,
      variantsCreated: 0,
      pricingRecordsCreated: 0,
      errors: [],
    };

    try {
      // 1. Fetch all blueprints from Printify
      const blueprints = await this.fetchPrintifyBlueprints();
      console.log(`Found ${blueprints.length} blueprints to sync`);

      // Filter blueprints if specific IDs provided
      const blueprintsToSync = options.blueprintIds
        ? blueprints.filter((b) => options.blueprintIds!.includes(b.id))
        : blueprints;

      // 2. Fetch and sync providers first
      await this.syncProviders();

      // 3. Sync each blueprint
      for (const blueprint of blueprintsToSync) {
        try {
          console.log(`Syncing blueprint ${blueprint.id}: ${blueprint.title}`);

          // Upsert product to catalog_products
          const product = await this.upsertCatalogProduct(blueprint);
          if (product) {
            result.productsCreated++;
          }

          // Fetch variants for this blueprint
          const variants = await this.fetchBlueprintVariants(blueprint.id);

          // Upsert variants to product_variants
          const variantCount = await this.upsertProductVariants(
            product.id,
            blueprint.id,
            variants
          );
          result.variantsCreated += variantCount;

          // For each country, fetch provider availability and pricing
          for (const country of options.countries) {
            const providers = await this.fetchProvidersForBlueprint(
              blueprint.id
            );

            for (const provider of providers) {
              // Fetch shipping info for this provider
              const shippingInfo = await this.fetchShippingInfo(
                blueprint.id,
                provider.id,
                country
              );

              if (shippingInfo) {
                // Upsert provider availability
                await this.upsertProviderAvailability(
                  product.id,
                  provider.id,
                  country,
                  shippingInfo
                );

                // Upsert variant pricing
                const pricingCount = await this.upsertVariantPricing(
                  product.id,
                  blueprint.id,
                  provider.id,
                  country,
                  variants,
                  shippingInfo
                );
                result.pricingRecordsCreated += pricingCount;
              }
            }
          }
        } catch (error) {
          console.error(`Error syncing blueprint ${blueprint.id}:`, error);
          result.errors.push({
            blueprintId: blueprint.id,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      result.success = result.errors.length === 0;
      return result;
    } catch (error) {
      console.error("Fatal error during catalog sync:", error);
      throw error;
    }
  }

  /**
   * Fetch all blueprints from Printify catalog
   */
  private async fetchPrintifyBlueprints(): Promise<PrintifyBlueprint[]> {
    const response = await fetch(`${PRINTIFY_API_BASE}/catalog/blueprints.json`, {
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch blueprints: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  /**
   * Fetch variants for a specific blueprint
   */
  private async fetchBlueprintVariants(
    blueprintId: number
  ): Promise<PrintifyVariant[]> {
    const response = await fetch(
      `${PRINTIFY_API_BASE}/catalog/blueprints/${blueprintId}.json`,
      {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch blueprint ${blueprintId}: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.variants || [];
  }

  /**
   * Fetch providers for a specific blueprint
   */
  private async fetchProvidersForBlueprint(
    blueprintId: number
  ): Promise<PrintifyProvider[]> {
    const response = await fetch(
      `${PRINTIFY_API_BASE}/catalog/blueprints/${blueprintId}/print_providers.json`,
      {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch providers for blueprint ${blueprintId}: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  }

  /**
   * Fetch shipping info for a blueprint + provider + country
   */
  private async fetchShippingInfo(
    blueprintId: number,
    providerId: number,
    country: string
  ): Promise<PrintifyShippingInfo | null> {
    try {
      const response = await fetch(
        `${PRINTIFY_API_BASE}/catalog/blueprints/${blueprintId}/print_providers/${providerId}/shipping.json`,
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
          },
        }
      );

      if (!response.ok) {
        console.warn(
          `No shipping info for blueprint ${blueprintId}, provider ${providerId}`
        );
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.warn(
        `Error fetching shipping info for blueprint ${blueprintId}, provider ${providerId}:`,
        error
      );
      return null;
    }
  }

  /**
   * Sync providers to database
   */
  private async syncProviders(): Promise<void> {
    const response = await fetch(
      `${PRINTIFY_API_BASE}/catalog/print_providers.json`,
      {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch providers: ${response.statusText}`);
    }

    const providers: PrintifyProvider[] = await response.json();

    for (const provider of providers) {
      await this.supabaseRequest("print_providers", "POST", {
        id: provider.id,
        name: provider.title,
        description: `${provider.location.city}, ${provider.location.country}`,
        supported_countries: [], // Will be populated during sync
        is_active: true,
      });
    }
  }

  /**
   * Upsert product to catalog_products table
   */
  private async upsertCatalogProduct(
    blueprint: PrintifyBlueprint
  ): Promise<CatalogProduct> {
    const payload = {
      blueprint_id: blueprint.id,
      name: blueprint.title,
      description: blueprint.description,
      base_image_url: blueprint.images?.[0]?.src || null,
      is_active: true,
    };

    const response = await this.supabaseRequest(
      "catalog_products",
      "POST",
      payload,
      {
        onConflict: "blueprint_id",
        prefer: "return=representation",
      }
    );

    return response[0];
  }

  /**
   * Upsert product variants
   */
  private async upsertProductVariants(
    productId: string,
    blueprintId: number,
    variants: PrintifyVariant[]
  ): Promise<number> {
    let count = 0;

    for (const variant of variants) {
      const payload = {
        product_id: productId,
        printify_variant_id: variant.id,
        color: variant.options?.color || null,
        size: variant.options?.size || null,
        title: variant.title,
      };

      await this.supabaseRequest("product_variants", "POST", payload, {
        onConflict: "product_id,printify_variant_id",
        prefer: "return=representation",
      });

      count++;
    }

    return count;
  }

  /**
   * Upsert provider availability
   */
  private async upsertProviderAvailability(
    productId: string,
    providerId: number,
    country: string,
    shippingInfo: PrintifyShippingInfo
  ): Promise<void> {
    // Find shipping profile for this country
    const profile = shippingInfo.profiles.find((p) =>
      p.countries.includes(country)
    );

    if (!profile) {
      return; // No shipping to this country
    }

    const payload = {
      product_id: productId,
      print_provider_id: providerId,
      country_code: country,
      currency_code: profile.first_item.currency,
      base_price_cents: profile.first_item.cost,
      shipping_cost_cents: profile.first_item.cost,
      production_time_days: shippingInfo.handling_time.value,
      is_available: true,
      last_synced_at: new Date().toISOString(),
    };

    await this.supabaseRequest(
      "product_provider_availability",
      "POST",
      payload,
      {
        onConflict: "product_id,print_provider_id,country_code",
        prefer: "return=representation",
      }
    );
  }

  /**
   * Upsert variant pricing
   */
  private async upsertVariantPricing(
    productId: string,
    blueprintId: number,
    providerId: number,
    country: string,
    variants: PrintifyVariant[],
    shippingInfo: PrintifyShippingInfo
  ): Promise<number> {
    let count = 0;

    // Get all variants for this product from database
    const dbVariants = await this.supabaseRequest(
      "product_variants",
      "GET",
      null,
      {
        select: "id,printify_variant_id",
        filter: `product_id=eq.${productId}`,
      }
    );

    const profile = shippingInfo.profiles.find((p) =>
      p.countries.includes(country)
    );

    if (!profile) {
      return 0;
    }

    for (const dbVariant of dbVariants) {
      // Check if this variant has shipping for this profile
      const hasShipping = profile.variant_ids.includes(
        dbVariant.printify_variant_id
      );

      if (hasShipping) {
        const payload = {
          variant_id: dbVariant.id,
          print_provider_id: providerId,
          country_code: country,
          price_cents: profile.first_item.cost,
          cost_cents: profile.first_item.cost,
          is_available: true,
          last_synced_at: new Date().toISOString(),
        };

        await this.supabaseRequest("variant_pricing", "POST", payload, {
          onConflict: "variant_id,print_provider_id,country_code",
          prefer: "return=representation",
        });

        count++;
      }
    }

    return count;
  }

  /**
   * Generic Supabase request helper
   */
  private async supabaseRequest(
    table: string,
    method: "GET" | "POST",
    body: any = null,
    params: Record<string, string> = {}
  ): Promise<any> {
    const url = new URL(`${this.supabaseUrl}/rest/v1/${table}`);

    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (key === "onConflict") {
        url.searchParams.append("on_conflict", value);
      } else if (key === "prefer") {
        // Handled in headers
      } else {
        url.searchParams.append(key, value);
      }
    });

    const headers: Record<string, string> = {
      apikey: this.supabaseKey,
      Authorization: `Bearer ${this.supabaseKey}`,
      "Content-Type": "application/json",
    };

    if (params.prefer) {
      headers.Prefer = params.prefer;
    }

    if (params.onConflict) {
      headers.Prefer = `resolution=merge-duplicates,${params.prefer || ""}`;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && method === "POST") {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url.toString(), options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Supabase request failed (${response.status}): ${errorText}`
      );
    }

    return response.json();
  }
}
