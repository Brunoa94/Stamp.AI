/**
 * Reads the error code an Edge Function returned (`{ error: "CODE" }`).
 *
 * supabase.functions.invoke reports non-2xx responses as a FunctionsHttpError
 * whose `context` is the raw Response; anything else yields null.
 */
export async function readFunctionErrorCode(error: unknown): Promise<string | null> {
  const context = (error as { context?: unknown } | null)?.context;
  if (!(context instanceof Response)) return null;
  try {
    const body: unknown = await context.clone().json();
    const code = (body as { error?: unknown } | null)?.error;
    return typeof code === "string" ? code : null;
  } catch {
    return null;
  }
}
