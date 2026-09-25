import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PRINTIFY_TOKEN = process.env.PRINTIFY_API_TOKEN;

export async function GET(request: NextRequest) {
  // Require authentication — this route uses the privileged Printify token.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const productId = request.nextUrl.searchParams.get("product_id");

  // Shop product IDs are 24-character hex strings, unlike numeric blueprint IDs.
  if (!productId || !/^[a-f0-9]{24}$/i.test(productId)) {
    return NextResponse.json({ error: "Invalid product_id" }, { status: 400 });
  }

  // Ownership: only the creator of a custom product may fetch it through the
  // privileged merchant token. RLS on `products` already limits the lookup to
  // the caller's own rows; the explicit user_id filter keeps the intent clear.
  const { data: ownedProduct, error: lookupError } = await supabase
    .from("products")
    .select("id")
    .eq("printify_product_id", productId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (lookupError) {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 502 });
  }
  if (!ownedProduct) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  try {
    const res = await fetch(
      `https://api.printify.com/v1/shops/${process.env.PRINTIFY_SHOP_ID}/products/${encodeURIComponent(productId)}.json`,
      {
        headers: {
          Authorization: `Bearer ${PRINTIFY_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch product" },
        { status: res.status === 404 ? 404 : 502 },
      );
    }

    const body = await res.json();
    return NextResponse.json(body);
  } catch {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 502 });
  }
}
