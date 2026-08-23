/**
 * One-time backfill of product_seo for all existing catalog products.
 *
 * For every row in catalog_products, fetches the blueprint from the
 * Printify API and upserts its description into product_seo. Only
 * printify_description is written — admin-edited meta fields on
 * existing rows are preserved.
 *
 * Run with: npx tsx scripts/backfill-product-seo.ts
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PRINTIFY_API_TOKEN
 */

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Load env vars from .env.local
function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        const value = valueParts.join("=").replace(/^["']|["']$/g, "");
        process.env[key] = value;
      }
    }
  }
}

// Printify rate-limit safety margin between API calls
const API_RATE_LIMIT_MS = 500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchBlueprintDescription(
  blueprintId: number,
  token: string
): Promise<string | null> {
  const response = await fetch(
    `https://api.printify.com/v1/catalog/blueprints/${blueprintId}.json`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!response.ok) {
    throw new Error(`Printify API returned ${response.status}`);
  }

  const blueprint = await response.json();
  const description =
    typeof blueprint.description === "string" ? blueprint.description.trim() : "";

  return description.length > 0 ? description : null;
}

async function main() {
  loadEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const printifyToken = process.env.PRINTIFY_API_TOKEN;

  if (!supabaseUrl || !serviceRoleKey || !printifyToken) {
    console.error(
      "Missing env vars. Need NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and PRINTIFY_API_TOKEN in .env.local"
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log("Fetching catalog products...");
  const { data: products, error } = await supabase
    .from("catalog_products")
    .select("blueprint_id, display_title")
    .order("blueprint_id");

  if (error) {
    console.error("Failed to fetch catalog_products:", error.message);
    process.exit(1);
  }

  if (!products || products.length === 0) {
    console.log("No catalog products found — nothing to backfill.");
    return;
  }

  console.log(`Backfilling SEO data for ${products.length} products...\n`);

  let synced = 0;
  let skipped = 0;
  let failed = 0;

  for (const product of products) {
    const label = `${product.blueprint_id} (${product.display_title})`;

    try {
      const description = await fetchBlueprintDescription(
        product.blueprint_id,
        printifyToken
      );

      if (!description) {
        console.log(`- ${label}: no description on Printify, skipping`);
        skipped++;
      } else {
        const { error: upsertError } = await supabase.from("product_seo").upsert(
          {
            blueprint_id: product.blueprint_id,
            printify_description: description,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "blueprint_id", ignoreDuplicates: false }
        );

        if (upsertError) {
          throw new Error(upsertError.message);
        }

        console.log(`✅ ${label}: description synced (${description.length} chars)`);
        synced++;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`❌ ${label}: ${message}`);
      failed++;
    }

    await sleep(API_RATE_LIMIT_MS);
  }

  console.log(`\nDone. Synced: ${synced}, skipped: ${skipped}, failed: ${failed}`);

  if (failed > 0) {
    process.exit(1);
  }
}

main();
