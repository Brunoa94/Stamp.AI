/**
 * Fetches a remote image as a Blob.
 * Tries a direct fetch first; falls back to the server-side proxy route to
 * bypass CORS restrictions for third-party CDN URLs (e.g. Printify).
 */
export async function fetchRemoteImageBlob(
  imageUrl: string,
): Promise<Blob | null> {
  try {
    const directResponse = await fetch(imageUrl, { cache: "no-store" });
    if (directResponse.ok) {
      return await directResponse.blob();
    }
  } catch {
    // Fallback to API proxy below.
  }

  try {
    const proxyUrl = `/api/fetch-remote-image?url=${encodeURIComponent(imageUrl)}`;
    const proxiedResponse = await fetch(proxyUrl, { cache: "no-store" });
    if (!proxiedResponse.ok) return null;
    return await proxiedResponse.blob();
  } catch {
    return null;
  }
}
