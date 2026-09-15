/**
 * Formatting helpers shared by the customer email templates.
 *
 * Pure (no Deno globals) so templates can be unit tested from vitest.
 * Amounts are stored in cents, as in the orders and invoices tables.
 */

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
}

export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (char) => HTML_ENTITIES[char] ?? char)
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  DKK: 'kr ',
  SEK: 'kr ',
  NOK: 'kr ',
}

export function formatMoney(amountInCents: number | null | undefined, currency: string | null): string {
  const value = (amountInCents ?? 0) / 100
  const code = (currency || 'EUR').toUpperCase()
  const symbol = CURRENCY_SYMBOLS[code]
  return symbol ? `${symbol}${value.toFixed(2)}` : `${value.toFixed(2)} ${code}`
}

/**
 * Flatten a checkout address (shipping/billing JSONB) into printable lines.
 * Tolerates both snake_case and camelCase checkout fields and missing data.
 */
export function formatAddressLines(address: Record<string, unknown> | null | undefined): string[] {
  if (!address) return []

  const get = (...keys: string[]): string => {
    for (const key of keys) {
      const value = address[key]
      if (typeof value === 'string' && value.trim()) return value.trim()
    }
    return ''
  }

  const name = [get('first_name', 'firstName'), get('last_name', 'lastName')].filter(Boolean).join(' ')
  const cityLine = [get('zip', 'postal_code', 'zipCode', 'postalCode'), get('city')].filter(Boolean).join(' ')

  return [
    name,
    get('address1', 'address_line1', 'addressLine1', 'street'),
    get('address2', 'address_line2', 'addressLine2'),
    cityLine,
    [get('region', 'state'), get('country', 'country_code', 'countryCode')].filter(Boolean).join(', '),
  ].filter(Boolean)
}

export function firstNameOf(fullName: string | null | undefined): string | null {
  const first = (fullName || '').trim().split(/\s+/)[0]
  return first || null
}
