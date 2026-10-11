/**
 * Brevo transactional email configuration (pure; env passed in).
 *
 * Outside production a missing API key just disables email. In production a
 * missing key or sender is a misconfiguration that must be reported, not
 * skipped silently: customers would get no confirmation or invoice.
 */

export type BrevoConfigT =
  | { status: "ready"; apiKey: string; fromEmail: string; fromName: string }
  | { status: "disabled" }
  | { status: "misconfigured"; missing: string[] };

type EnvT = Record<string, string | undefined>;

/** The test project sets APP_ENV=test; production leaves it unset or "production". */
export function isProductionEnv(env: EnvT): boolean {
  return (env.APP_ENV || "production") === "production";
}

export function resolveBrevoConfig(env: EnvT): BrevoConfigT {
  const apiKey = env.BREVO_API_KEY;
  const fromEmail = env.BREVO_FROM_EMAIL || env.INVOICE_FROM_EMAIL;
  const fromName = env.BREVO_FROM_NAME || env.INVOICE_SELLER_NAME || "Stamp.AI";
  if (apiKey && fromEmail) return { status: "ready", apiKey, fromEmail, fromName };

  const missing = [!apiKey && "BREVO_API_KEY", !fromEmail && "BREVO_FROM_EMAIL"].filter(Boolean) as string[];
  if (!apiKey && !isProductionEnv(env)) return { status: "disabled" };
  return { status: "misconfigured", missing };
}
