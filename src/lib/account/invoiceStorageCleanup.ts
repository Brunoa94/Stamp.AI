import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { InvoicePdfRefType } from "@/schemas/account";

export const INVOICES_BUCKET = "invoices";

export type InvoiceStorageCleanupResultType = {
  removed: string[];
  failed: string[];
};

function groupByBucket(refs: InvoicePdfRefType[]): Map<string, Set<string>> {
  const groups = new Map<string, Set<string>>();
  for (const ref of refs) {
    const paths = groups.get(ref.bucket) ?? new Set<string>();
    paths.add(ref.path);
    groups.set(ref.bucket, paths);
  }
  return groups;
}

async function listUserInvoiceFolder(
  supabaseAdmin: SupabaseClient<Database>,
  userId: string,
): Promise<string[]> {
  const { data, error } = await supabaseAdmin.storage
    .from(INVOICES_BUCKET)
    .list(userId, { limit: 1000 });
  if (error || !data) return [];
  return data.map((object) => `${userId}/${object.name}`);
}

/**
 * Removes a deleted user's invoice PDFs from storage (service role) and clears
 * the pdf references on the retained, already-anonymised invoice rows.
 *
 * Deletes both the paths reported by delete_own_account() and everything in
 * the user's `{user_id}/` folder of the invoices bucket, so orphaned objects
 * are cleaned too. Failures are reported, never thrown: account deletion must
 * still complete and the audit trail is the route's responsibility.
 */
export async function removeUserInvoicePdfs(
  supabaseAdmin: SupabaseClient<Database>,
  userId: string,
  refs: InvoicePdfRefType[],
): Promise<InvoiceStorageCleanupResultType> {
  const groups = groupByBucket(refs);
  const folderPaths = await listUserInvoiceFolder(supabaseAdmin, userId);
  if (folderPaths.length > 0) {
    const invoicePaths = groups.get(INVOICES_BUCKET) ?? new Set<string>();
    folderPaths.forEach((path) => invoicePaths.add(path));
    groups.set(INVOICES_BUCKET, invoicePaths);
  }

  const removed: string[] = [];
  const failed: string[] = [];

  for (const [bucket, pathSet] of groups) {
    const paths = Array.from(pathSet);
    const { error } = await supabaseAdmin.storage.from(bucket).remove(paths);
    (error ? failed : removed).push(...paths.map((path) => `${bucket}/${path}`));
  }

  if (removed.length > 0) {
    const removedPaths = refs
      .filter((ref) => removed.includes(`${ref.bucket}/${ref.path}`))
      .map((ref) => ref.path);
    if (removedPaths.length > 0) {
      await supabaseAdmin
        .from("invoices")
        .update({ pdf_bucket: null, pdf_path: null })
        .in("pdf_path", removedPaths);
    }
  }

  return { removed, failed };
}
