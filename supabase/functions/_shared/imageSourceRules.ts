const IMAGE_HOSTS = new Set([
  "images.printify.com", "images-api.printify.com",
  "pfy-prod-image-storage.s3.us-east-2.amazonaws.com",
  "oaidalleapiprodscus.blob.core.windows.net", "placehold.co",
]);
/** Trust only our own storage project and named provider CDNs, never all tenants. */
export function isAllowedImageSource(raw: string, supabaseUrl: string): boolean {
  try {
    const url = new URL(raw);
    const project = new URL(supabaseUrl);
    if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443")) return false;
    return IMAGE_HOSTS.has(url.hostname) || (url.hostname === project.hostname && url.pathname.startsWith("/storage/v1/object/"));
  } catch { return false; }
}
