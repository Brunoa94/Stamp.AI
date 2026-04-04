import { NextRequest, NextResponse } from "next/server";

const PRINTIFY_TOKEN = process.env.PRINTIFY_API_TOKEN;

export async function GET(request: NextRequest) {
    try{
        const url = new URL(request.url);
        const productId = url.searchParams.get("product_id");

        if (!productId) {
            return NextResponse.json({ error: "Missing product_id" }, { status: 400 });
        }

        const res = await fetch(`https://api.printify.com/v1/shops/${process.env.PRINTIFY_SHOP_ID}/products/${productId}.json`, {
            headers: {
            "Authorization": `Bearer ${PRINTIFY_TOKEN}`,
            "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            throw new Error(`Printify API error: ${res.status}`);
        }
        const body = await res.json();

        return NextResponse.json(body);
    }catch(e){
        throw e
    }
}