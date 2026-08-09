/**
 * Server-only Request ID Utilities
 *
 * These utilities use next/headers and are NOT Edge-compatible.
 * Use only in Server Components and API routes (not middleware).
 */

import { headers } from "next/headers";
import { REQUEST_ID_HEADER } from "./requestId";

/**
 * Get request ID in a server component or API route
 * Uses Next.js headers() function
 *
 * @returns Request ID or undefined if not in request context
 */
export async function getServerRequestId(): Promise<string | undefined> {
  try {
    const headersList = await headers();
    return headersList.get(REQUEST_ID_HEADER) || undefined;
  } catch {
    // Not in a request context
    return undefined;
  }
}
