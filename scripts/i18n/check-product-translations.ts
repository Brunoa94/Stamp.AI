/**
 * Reports gaps and drift in the translated product text
 * (src/shared/constants/productText/{pt,nl}.ts) against the live catalog.
 *
 * Report-only: always exits 0. A stale translation is kept until someone
 * updates it by hand, so this tells you what to look at, never blocks.
 *
 * Run with: npm run i18n:check-products [-- --inventory]
 *   --inventory  also prints each active blueprint's English source text,
 *                its hashes, and every colour and paper type, which is the
 *                input for writing or refreshing translations.
 * Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from the
 * environment or .env.local. Without them it skips the live checks.
 */

import { createHash } from "crypto";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { extractProductSpecs, resolveProductDescription } from "../../src/lib/seo/productDescription";
import { PRODUCT_TEXT } from "../../src/shared/constants/productText/productTextByLocale";
import { normalizeLabelKey } from "../../src/shared/helpers/localizeProduct";
import type { ProductTextT, TranslatedLocaleT } from "../../src/shared/types/productText";

/** Paper types arrive in the variant's colour option (see PaperTypeOptions) */
const PAPER_TYPES = new Set(["blank", "lined", "dotgrid", "task", "graph"]);

/** Colour-field values that are sizes or placeholders and stay as they are */
const LANGUAGE_NEUTRAL = /^(default|[0-9].*|xs|s|m|l|xl|\d?xl)$/i;

type SourceT = {
  blueprintId: number;
  title: string;
  description: string | null;
  specs: string[];
  titleHash: string;
  descriptionHash: string;
};

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...valueParts] = trimmed.split("=");
    process.env[key] ??= valueParts.join("=").replace(/^["']|["']$/g, "");
  }
}

/** First 12 hex of sha-256; parts joined with a newline so the hash is deterministic */
function hash(...parts: string[]): string {
  return createHash("sha256").update(parts.join("\n")).digest("hex").slice(0, 12);
}

async function loadSources(url: string, key: string) {
  const supabase = createClient(url, key);
  const [products, variants] = await Promise.all([
    supabase
      .from("catalog_products")
      .select("blueprint_id, display_title, product_seo(printify_description, meta_description)")
      .eq("is_active", true)
      .order("blueprint_id"),
    supabase.from("product_variants").select("blueprint_id, color"),
  ]);
  if (products.error) throw products.error;
  if (variants.error) throw variants.error;

  const sources: SourceT[] = products.data.map((row) => {
    const seo = Array.isArray(row.product_seo) ? row.product_seo[0] : row.product_seo;
    const description = resolveProductDescription(seo ?? null);
    const specs = extractProductSpecs(seo ?? null);
    return {
      blueprintId: row.blueprint_id,
      title: row.display_title,
      description,
      specs,
      titleHash: hash(row.display_title),
      descriptionHash: hash(description ?? "", ...specs),
    };
  });

  const activeIds = new Set(sources.map((source) => source.blueprintId));
  const colors = new Set<string>();
  const paperTypes = new Set<string>();
  for (const variant of variants.data) {
    if (!activeIds.has(variant.blueprint_id) || !variant.color) continue;
    if (LANGUAGE_NEUTRAL.test(variant.color.trim())) continue;
    (PAPER_TYPES.has(normalizeLabelKey(variant.color)) ? paperTypes : colors).add(variant.color);
  }

  return { sources, colors: [...colors].sort(), paperTypes: [...paperTypes].sort() };
}

function checkLocale(
  locale: TranslatedLocaleT,
  text: ProductTextT,
  sources: SourceT[],
  colors: string[],
  paperTypes: string[],
): string[] {
  const findings: string[] = [];
  const byId = new Map(sources.map((source) => [source.blueprintId, source]));

  for (const source of sources) {
    const translation = text.products[source.blueprintId];
    if (!translation) {
      findings.push(`missing: blueprint ${source.blueprintId} (${source.title}) has no entry`);
      continue;
    }
    if (!translation.title) findings.push(`missing: blueprint ${source.blueprintId} has no title`);
    if (source.description && !translation.description) {
      findings.push(`missing: blueprint ${source.blueprintId} has no description`);
    }
    if (source.specs.length > 0 && (translation.specs?.length ?? 0) !== source.specs.length) {
      findings.push(
        `specs: blueprint ${source.blueprintId} has ${translation.specs?.length ?? 0} specs, English has ${source.specs.length}`,
      );
    }
    if (translation.source.titleHash !== source.titleHash) {
      findings.push(`drift: blueprint ${source.blueprintId} English title changed since it was translated`);
    }
    if (translation.source.descriptionHash !== source.descriptionHash) {
      findings.push(`drift: blueprint ${source.blueprintId} English description or specs changed since it was translated`);
    }
  }

  for (const id of Object.keys(text.products).map(Number)) {
    if (!byId.has(id)) findings.push(`unused: blueprint ${id} is not an active catalog product`);
  }

  for (const color of colors) {
    if (!text.labels.color[normalizeLabelKey(color)]) findings.push(`label: colour "${color}" has no translation`);
  }
  for (const paperType of paperTypes) {
    if (!text.labels.paperType[normalizeLabelKey(paperType)]) {
      findings.push(`label: paper type "${paperType}" has no translation`);
    }
  }

  return findings.map((finding) => `[${locale}] ${finding}`);
}

function checkParity(): string[] {
  const pt = new Set(Object.keys(PRODUCT_TEXT.pt.products));
  const nl = new Set(Object.keys(PRODUCT_TEXT.nl.products));
  return [
    ...[...pt].filter((id) => !nl.has(id)).map((id) => `parity: blueprint ${id} is in pt but not nl`),
    ...[...nl].filter((id) => !pt.has(id)).map((id) => `parity: blueprint ${id} is in nl but not pt`),
  ];
}

async function main() {
  loadEnv();
  const inventory = process.argv.includes("--inventory");
  const findings = checkParity();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.log("Skipped the live checks: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set.");
  } else {
    const { sources, colors, paperTypes } = await loadSources(url, key);
    for (const locale of Object.keys(PRODUCT_TEXT) as TranslatedLocaleT[]) {
      findings.push(...checkLocale(locale, PRODUCT_TEXT[locale], sources, colors, paperTypes));
    }
    if (inventory) console.log(JSON.stringify({ sources, colors, paperTypes }, null, 2));
  }

  for (const finding of findings) console.log(finding);
  console.log(findings.length === 0 ? "Product translations: no findings." : `Product translations: ${findings.length} finding(s).`);
}

main().catch((error) => {
  // Report-only: a failed read is shown, never fails the caller.
  console.log(`Product translation check could not run: ${error instanceof Error ? error.message : String(error)}`);
});
