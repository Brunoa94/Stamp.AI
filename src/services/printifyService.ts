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

export class PrintifyService {
    static async getCustomProduct(productId: string): Promise<CustomProductT> {
        try{
            const url = `/api/fetch-custom-product?product_id=${productId}`;

            const response = await GET<CustomProductT>(url);

            // Validate API response
            const validatedResponse = CustomProductResponseSchema.parse(response);

            return validatedResponse as CustomProductT;
        }catch(error){
            if (error instanceof z.ZodError) {
                throw new Error(`Custom product response validation failed: ${error.message}`);
            }
            throw new Error('Error getting the custom product');
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
            if (error instanceof z.ZodError) {
                throw new Error(`Printify order validation failed: ${error.message}`);
            }
            if (error instanceof Error) {
                throw new Error(`Printify order creation failed: ${error.message}`);
            }
            throw new Error('Printify order creation failed: Unknown error occurred');
        }
    }
}