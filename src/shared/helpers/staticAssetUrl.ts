/** Public Supabase Storage bucket holding the site's static images (filled by scripts/push-static-assets.mjs) */
const STATIC_ASSETS_BUCKET = "static-assets";

type StaticAssetBaseT = {
  /** Full base URL of the asset CDN; overrides the Supabase project bucket */
  assetsBaseUrl?: string;
  supabaseUrl?: string;
};

/**
 * CDN URL of a static image, from its path in the bucket ("/home/1-a.png").
 * Without a configured base URL the root-relative path is returned unchanged.
 */
function buildStaticAssetUrl(assetPath: string, { assetsBaseUrl, supabaseUrl }: StaticAssetBaseT): string {
  const key = assetPath.replace(/^\/+/, "").split("/").map(encodeURIComponent).join("/");
  const base = assetsBaseUrl
    ? assetsBaseUrl.replace(/\/+$/, "")
    : supabaseUrl
      ? `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/${STATIC_ASSETS_BUCKET}`
      : "";
  return `${base}/${key}`;
}

/**
 * CDN URL of a static image for the current environment. NEXT_PUBLIC_STATIC_ASSETS_URL
 * wins when set; otherwise the bucket of NEXT_PUBLIC_SUPABASE_URL, so the test
 * project serves its own copy. The env reads stay literal so Next inlines them.
 */
export function staticAssetUrl(assetPath: string): string {
  return buildStaticAssetUrl(assetPath, {
    assetsBaseUrl: process.env.NEXT_PUBLIC_STATIC_ASSETS_URL,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  });
}
