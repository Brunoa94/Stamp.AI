import { createClient } from "@/lib/supabase/client";
import type { TshirtType } from "@/types/product";
import { ErrorClient } from "./errorClient";

interface ProductsProviderRow {
  id: string;
  country_code: string;
  blueprint_id: number;
  print_provider_id: number;
  title: string;
  description: string | null;
  brand: string | null;
  model: string | null;
  images: any; // JSONB
  print_areas: any; // JSONB
  min_price: number;
  provider_name: string | null;
  shipping_cost: number;
  total_cost: number;
  rank: number;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export class BlueprintCacheService {
  private static getSupabase() {
    return createClient();
  }

  /**
   * Get cached blueprints from database for a specific country
   * Returns null if no valid cache exists or if cache is expired
   */
  static async getCachedBlueprints(countryCode: string): Promise<TshirtType[] | null> {
    try {
      const supabase = this.getSupabase();

      const { data, error } = await supabase
        .from('products_provider')
        .select('*')
        .eq('country_code', countryCode)
        .gt('expires_at', new Date().toISOString())
        .order('rank', { ascending: true });

      if (error) {
        console.error('Error fetching cached blueprints:', error);
        return null;
      }

      if (!data || data.length === 0) {
        console.log(`No valid cache found for country: ${countryCode}`);
        return null;
      }

      console.log(`✅ Cache hit! Found ${data.length} cached blueprints for ${countryCode}`);

      // Transform database rows to TshirtType format
      const tshirtProducts: TshirtType[] = (data as ProductsProviderRow[]).map((row) => ({
        id: `blueprint-${row.blueprint_id}`,
        name: row.title,
        description: row.description || `${row.brand} ${row.model}`,
        image: (Array.isArray(row.images) && row.images.length > 0) ? row.images[0] : "/api/placeholder/200/200",
        features: Array.isArray(row.print_areas)
          ? row.print_areas.map((area: { position: string; width: number; height: number }) => area.position)
          : [],
        price: row.min_price ? row.min_price / 100 : 0,
        material: row.brand || "Cotton",
        fit: "Classic",
        blueprint_id: row.blueprint_id,
        print_provider_id: row.print_provider_id,
        brand: row.brand || "Unknown",
        model: row.model || "Unknown",
      }));

      return tshirtProducts;
    } catch (error) {
      console.error('Error in getCachedBlueprints:', error);
      // Return null on error to fall back to edge function
      return null;
    }
  }

  /**
   * Check if valid cache exists for a country
   */
  static async hasCachedBlueprints(countryCode: string): Promise<boolean> {
    try {
      const supabase = this.getSupabase();

      const { count, error } = await supabase
        .from('products_provider')
        .select('*', { count: 'exact', head: true })
        .eq('country_code', countryCode)
        .gt('expires_at', new Date().toISOString());

      if (error) {
        return false;
      }

      return (count ?? 0) > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Manually invalidate cache for a country
   * Useful for forcing a refresh of blueprint data
   */
  static async invalidateCache(countryCode: string): Promise<boolean> {
    try {
      const supabase = this.getSupabase();

      const { error } = await supabase
        .from('products_provider')
        .delete()
        .eq('country_code', countryCode);

      if (error) {
        throw ErrorClient.handleError({
          error,
          service: "BlueprintCache",
          action: "Invalidate Cache"
        });
      }

      console.log(`✅ Cache invalidated for country: ${countryCode}`);
      return true;
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "BlueprintCache",
        action: "Invalidate Cache"
      });
    }
  }
}
