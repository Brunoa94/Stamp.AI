import { CustomProductT } from "@/types/printify";
import { GET } from "./apiClient";

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
}