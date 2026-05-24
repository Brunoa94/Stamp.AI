import { CustomProductT } from "@/types/printify";
import { GET } from "./apiClient";
import {
  CustomProductResponseSchema,
  CreatePrintifyOrderRequestSchema,
  PrintifyOrderResponseSchema
} from "@/schemas/services";
import { createClient } from "@/lib/supabase/client";
import type {
    CreatePrintifyOrderRequest,
    PrintifyOrderResponse
} from "@/types/printifyOrder";
import { ProductCustomizationService, BlueprintVariantsResponse } from "./productCustomizationService";
import { ErrorClient } from "./errorClient";
import { TshirtType } from "@/types/product";
import { BlueprintI } from "@/types/api";

export class PrintifyService {
    private static getSupabaseConfig() {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        // Do not throw here; caller will fall back to relative functions URLs when
        // environment variables are not present (e.g. during Playwright tests).
        return { supabaseUrl, supabaseAnonKey };
    }

    static async getCustomProduct(productId: string): Promise<CustomProductT> {
        try{
            const url = `/api/fetch-custom-product?product_id=${productId}`;

            const response = await GET<CustomProductT>(url);

            // Validate API response
            const validatedResponse = CustomProductResponseSchema.parse(response);

            return validatedResponse as CustomProductT;
        }catch(error){
            throw ErrorClient.handleError({error, service: "Printify", action: "Get Custom Product"})
        }
    }

    static async getBlueprintVariants(
        blueprintId: number,
        printProviderId?: number
    ): Promise<BlueprintVariantsResponse> {
        // Delegate to ProductCustomizationService
        return ProductCustomizationService.fetchBlueprintVariants(
            blueprintId,
            printProviderId || 99
        );
    }

    /**
     * Create a Printify order via Supabase Edge Function
     *
     * CRITICAL: Validates test mode to prevent test orders in production
     */
    static async createPrintifyOrder(
        payload: CreatePrintifyOrderRequest
    ): Promise<PrintifyOrderResponse> {
        try {
            const supabase = createClient();

            // Validate request payload
            const validatedPayload = CreatePrintifyOrderRequestSchema.parse(payload);

            // ✅ CRITICAL FIX: Test mode validation
            const isProduction = process.env.NODE_ENV === 'production';
            const isTestOrder = validatedPayload.is_test === true;

            if (isProduction && isTestOrder) {
                // PREVENT test orders in production environment
                console.error('❌ CRITICAL: Attempted to create test order in production');
                throw new Error(
                    'Test mode orders are not allowed in production. Please set is_test to false.'
                );
            }

            if (!isProduction && !isTestOrder) {
                // WARN when creating production orders in non-production environment
                console.warn(
                    '⚠️ WARNING: Creating production order in non-production environment. ' +
                    'Consider setting is_test to true for development/staging.'
                );
            }

            if (isTestOrder) {
                console.log('🧪 Creating TEST Printify order (will not be sent to production)');
            } else {
                console.log('🚀 Creating PRODUCTION Printify order (will be manufactured and shipped)');
            }

            // Get the current session for authentication
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session) {
                throw new Error('You must be logged in to create a Printify order');
            }

            // Call the Supabase Edge Function
            const accessToken = session.access_token;
            const headers: Record<string, string> = {
                apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            };
            if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

            const { data, error } = await supabase.functions.invoke('create-printify-order', {
                body: validatedPayload,
                headers,
            });

            if (error) {
                console.error('Printify order creation error:', error);
                throw new Error(error.message || 'Failed to create Printify order');
            }

            if (!data) {
                throw new Error('No response data from Printify order creation');
            }

            // Validate response
            const validatedResponse = PrintifyOrderResponseSchema.parse(data);

            return validatedResponse as PrintifyOrderResponse;
        } catch (error) {
            throw ErrorClient.handleError({error, service: "Printify", action: "Create Printify Order"})
        }
    }

    /**
     * Fetch all t-shirt products from Printify catalog
     * Retrieves blueprints via Supabase Edge Function and transforms them to TshirtType
     * Returns the 4 cheapest options for shipping to Netherlands
     */
    static async getTshirtProducts(): Promise<TshirtType[]> {
        try {
            // Only attempt server-side cached blueprint lookup when running on the server.
            // On the client (browser/tests) we skip the DB cache to avoid invoking
            // server-only Supabase clients which require environment configuration.
            if (typeof window === "undefined") {
                const { BlueprintCacheService } = await import("./blueprintCacheService");
                const cachedBlueprints = await BlueprintCacheService.getCachedBlueprints("NL");

                if (cachedBlueprints && cachedBlueprints.length > 0) {
                    console.log("✅ Using cached blueprints from database");
                    return cachedBlueprints;
                }

                // Cache miss - fetch from edge function
                console.log("❌ Cache miss - fetching from edge function");
            } else {
                // Client-side: skip server cache lookup
                console.log("Client-side environment - skipping server-side cache lookup");
            }

            const { supabaseUrl, supabaseAnonKey } = this.getSupabaseConfig();

            // If NEXT_PUBLIC_SUPABASE_URL is not provided (e.g. local test runs),
            // fall back to a relative functions URL so Playwright route handlers
            // (which use the pattern **/functions/v1/...) can intercept requests.
            const fetchUrl = supabaseUrl
                ? `${supabaseUrl}/functions/v1/get-cheapest-blueprints`
                : `/functions/v1/get-cheapest-blueprints`;

            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };
            if (supabaseAnonKey) {
                headers["Authorization"] = `Bearer ${supabaseAnonKey}`;
            }

            const response = await fetch(fetchUrl, {
                method: "POST",
                headers,
                body: JSON.stringify({}),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || "Failed to fetch catalog blueprints");
            }

            // Transform BlueprintI to TshirtType
            const blueprints: BlueprintI[] = data.blueprints;

            // Map blueprints to TshirtType format
            const tshirtProducts: TshirtType[] = blueprints.map((blueprint) => ({
                id: `blueprint-${blueprint.id}`,
                name: blueprint.title,
                description: blueprint.description || `${blueprint.brand} ${blueprint.model}`,
                image: blueprint.images[0] || "/api/placeholder/200/200",
                images: blueprint.images || [],
                features: blueprint.printAreas.map((area: { position: string; width: number; height: number }) => area.position),
                price: blueprint.min_price ? blueprint.min_price / 100 : 0,
                material: blueprint.brand || "Cotton",
                fit: "Classic",
                blueprint_id: blueprint.id,
                print_provider_id: blueprint.print_provider_id || 99,
                brand: blueprint.brand,
                model: blueprint.model,
            }));

            return tshirtProducts;
        } catch (error) {
            throw ErrorClient.handleError({
                error,
                service: "Printify",
                action: "Get Tshirt Products"
            });
        }
    }
}