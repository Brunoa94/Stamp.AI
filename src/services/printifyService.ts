import { CustomProductT } from "@/types/printify";
import { GET, POST } from "./apiClient";
import { BlueprintVariantsResponseSchema } from "@/schemas/printify";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import type {
    CreatePrintifyOrderRequest,
    PrintifyOrderResponse
} from "@/types/printifyOrder";

export type BlueprintVariantsResponse = z.infer<typeof BlueprintVariantsResponseSchema>;

export class PrintifyService {
    static async getCustomProduct(productId: string): Promise<CustomProductT> {
        try{
            const url = `/api/fetch-custom-product?product_id=${productId}`;

            const response = await GET<CustomProductT>(url)

            return response
        }catch(e){
            throw new Error('Error getting the custom product');
        }
    }

    static async getBlueprintVariants(
        blueprintId: number,
        printProviderId?: number
    ): Promise<BlueprintVariantsResponse> {
        try {
            const url = `/api/get-blueprint-variants`;

            const response = await POST<BlueprintVariantsResponse>(url, {
                blueprint_id: blueprintId,
                print_provider_id: printProviderId,
            });

            const validatedResponse = BlueprintVariantsResponseSchema.parse(response);

            return validatedResponse;
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new Error(`Blueprint variants validation failed: ${error.message}`);
            }
            throw new Error('Error getting blueprint variants');
        }
    }

    /**
     * Create a Printify order via Supabase Edge Function
     */
    static async createPrintifyOrder(
        payload: CreatePrintifyOrderRequest
    ): Promise<PrintifyOrderResponse> {
        try {
            const supabase = createClient();

            // Get the current session for authentication
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session) {
                throw new Error('You must be logged in to create a Printify order');
            }

            // Call the Supabase Edge Function
            const { data, error } = await supabase.functions.invoke('create-printify-order', {
                body: payload,
            });

            if (error) {
                console.error('Printify order creation error:', error);
                throw new Error(error.message || 'Failed to create Printify order');
            }

            if (!data) {
                throw new Error('No response data from Printify order creation');
            }

            return data as PrintifyOrderResponse;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Printify order creation failed: ${error.message}`);
            }
            throw new Error('Printify order creation failed: Unknown error occurred');
        }
    }
}