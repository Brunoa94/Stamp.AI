import { CustomProductT } from "@/types/printify";
import { GET } from "./apiClient";
import {
  CustomProductResponseSchema,
  CreatePrintifyOrderRequestSchema,
  PrintifyOrderResponseSchema
} from "@/schemas/services/printifyServiceSchemas";
import { createClient } from "@/lib/supabase/client";
import type {
    CreatePrintifyOrderRequest,
    PrintifyOrderResponse
} from "@/types/printifyOrder";
import { ProductCustomizationService, BlueprintVariantsResponse } from "./productCustomizationService";
import { ErrorClient } from "./errorClient";
import { TshirtType } from "@/types/product";

export class PrintifyService {
    private static getSupabaseConfig() {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        // Do not throw here; caller will fall back to relative functions URLs when
        // environment variables are not present (e.g. during Playwright tests).
        return { supabaseUrl, supabaseAnonKey };
    }

    static async getCustomProduct(productId: string): Promise<CustomProductT> {
        try {
            const url = `/api/fetch-custom-product?product_id=${productId}`;

            const response = await GET<CustomProductT>(url);

            // Validate API response
            const validatedResponse = CustomProductResponseSchema.parse(response);

            return validatedResponse as CustomProductT;
        } catch (error) {
            throw ErrorClient.handleError({ error, service: "Printify", action: "Get Custom Product" });
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
            throw ErrorClient.handleError({ error, service: "Printify", action: "Create Printify Order" });
        }
    }

    /**
     * Fetch all t-shirt products from the new catalog system
     * This method is deprecated - use catalogQueries directly instead
     *
     * @deprecated Use catalogQueries.useCatalogProducts() instead
     * @param countryCode - ISO country code (e.g., 'NL', 'US', 'GB'). Defaults to 'NL'
     */
    static async getTshirtProducts(countryCode: string = "NL"): Promise<TshirtType[]> {
        throw new Error(
            `getTshirtProducts is deprecated. The provider_catalog system has been replaced. ` +
            `Use catalogQueries.useCatalogProducts() and catalogQueries.useProvidersForProduct() instead.`
        );
    }
}