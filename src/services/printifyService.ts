import { CustomProductT } from "@/types/printify";
import { GET } from "./apiClient";
import {
  CustomProductResponseSchema,
  CreatePrintifyOrderRequestSchema,
  PrintifyOrderResponseSchema
} from "@/schemas/services";
import { z } from "zod";
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
     */
    static async createPrintifyOrder(
        payload: CreatePrintifyOrderRequest
    ): Promise<PrintifyOrderResponse> {
        try {
            const supabase = createClient();

            // Validate request payload
            const validatedPayload = CreatePrintifyOrderRequestSchema.parse(payload);

            // Get the current session for authentication
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session) {
                throw new Error('You must be logged in to create a Printify order');
            }

            // Call the Supabase Edge Function
            const { data, error } = await supabase.functions.invoke('create-printify-order', {
                body: validatedPayload,
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
     */
    static async getTshirtProducts(): Promise<TshirtType[]> {
        try {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

            if (!supabaseUrl || !supabaseAnonKey) {
                throw new Error("Supabase configuration missing");
            }

            const response = await fetch(
                `${supabaseUrl}/functions/v1/get-catalog-blueprints`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${supabaseAnonKey}`,
                    },
                    body: JSON.stringify({}),
                }
            );

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
                features: blueprint.printAreas.map((area: { position: string; width: number; height: number }) => area.position),
                price: 0, // Base price, will be determined by variant selection
                material: blueprint.brand || "Cotton",
                fit: "Classic",
                blueprint_id: blueprint.id,
                print_provider_id: data.printProviderId || 99,
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