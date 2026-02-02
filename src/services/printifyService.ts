import { CustomProductT } from "@/types/printify";
import { GET, POST } from "./apiClient";
import { BlueprintVariantsResponseSchema } from "@/schemas/printify";
import { z } from "zod";

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
}