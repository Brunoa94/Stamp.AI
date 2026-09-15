/**
 * Brevo configuration resolution (pure; env passed in).
 *
 * Missing email configuration used to be skipped silently, which in
 * production means customers get no confirmation, invoice or shipping
 * emails and nobody notices. Now: throw in production, warn elsewhere.
 */

import { resolveEdgeEnvironment } from './sentryContext.ts'
import type { EnvRecordT } from './sentryContext.ts'

export class EmailNotConfiguredError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EmailNotConfiguredError'
  }
}

export type BrevoConfigT =
  | { status: 'ok'; apiKey: string; fromEmail: string; fromName: string }
  | { status: 'skipped'; reason: string }

/**
 * Resolve the Brevo sender configuration.
 * @throws EmailNotConfiguredError in production when a required var is missing.
 */
export function resolveBrevoConfig(env: EnvRecordT): BrevoConfigT {
  const isProduction = resolveEdgeEnvironment(env) === 'production'

  const fail = (reason: string): BrevoConfigT => {
    if (isProduction) throw new EmailNotConfiguredError(reason)
    return { status: 'skipped', reason }
  }

  const apiKey = env.BREVO_API_KEY
  if (!apiKey) return fail('BREVO_API_KEY is not set')

  const fromEmail = env.BREVO_FROM_EMAIL || env.INVOICE_FROM_EMAIL
  if (!fromEmail) return fail('BREVO_FROM_EMAIL (or INVOICE_FROM_EMAIL) is not set')

  return {
    status: 'ok',
    apiKey,
    fromEmail,
    fromName: env.BREVO_FROM_NAME || env.INVOICE_SELLER_NAME || 'Stamp.AI',
  }
}
