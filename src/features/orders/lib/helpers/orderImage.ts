const allowedHosts = new Set([
  "images.printify.com",
  "images-api.printify.com",
  "pfy-prod-image-storage.s3.us-east-2.amazonaws.com",
  "picsum.photos",
  "oaidalleapiprodscus.blob.core.windows.net",
  "placehold.co",
  "images.unsplash.com",
]);

export function getOrderImageSrc(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    if (allowedHosts.has(url.hostname) || url.hostname.endsWith(".supabase.co")) {
      return value;
    }
  } catch {
    return null;
  }

  return null;
}
