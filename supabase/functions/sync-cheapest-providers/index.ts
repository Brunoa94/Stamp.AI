import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { ErrorCodes, handleError } from "../_shared/errors.ts"
import { validateEnvVars } from "../_shared/validators.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface ProviderInfo {
  id: number
  title: string
}

interface ShippingProfile {
  variant_ids: number[]
  first_item: { currency: string; cost: number }
  additional_items: { currency: string; cost: number }
  countries: string[]
}

interface ShippingData {
  handling_time: { from: number; to: number }
  profiles: ShippingProfile[]
}

interface ProviderPricing {
  providerId: number
  providerName: string
  minPriceCents: number
  shippingCents: number
  totalCostCents: number
}

interface ProductUpdate {
  blueprintId: number
  displayTitle: string
  providerId: number
  providerName: string
  minPriceCents: number
  shippingCents: number
  totalCostCents: number
}

/**
 * Get shipping cost for Netherlands (NL) from shipping profiles
 * Falls back to EU > REST_OF_THE_WORLD > first profile
 */
function getShippingCostForNetherlands(shippingData: ShippingData): number {
  if (!shippingData?.profiles || shippingData.profiles.length === 0) {
    return 0
  }

  let nlProfile: ShippingProfile | undefined
  let euProfile: ShippingProfile | undefined
  let rowProfile: ShippingProfile | undefined

  for (const profile of shippingData.profiles) {
    if (profile.countries.includes('NL')) {
      nlProfile = profile
      break
    }
    if (profile.countries.includes('EU') || profile.countries.some(c =>
      ['DE', 'BE', 'FR', 'AT', 'ES', 'IT', 'PT', 'PL'].includes(c)
    )) {
      euProfile = profile
    }
    if (profile.countries.includes('REST_OF_THE_WORLD')) {
      rowProfile = profile
    }
  }

  const selectedProfile = nlProfile || euProfile || rowProfile || shippingData.profiles[0]
  return selectedProfile?.first_item?.cost || 0
}

/**
 * Fetch shipping cost for a single provider
 * Note: Printify catalog API doesn't return variant prices, only shipping
 */
async function getProviderShipping(
  blueprintId: number,
  provider: ProviderInfo,
  apiToken: string
): Promise<{ providerId: number; providerName: string; shippingCents: number } | null> {
  try {
    const shippingResponse = await fetch(
      `https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers/${provider.id}/shipping.json`,
      { headers: { 'Authorization': `Bearer ${apiToken}` } }
    )

    if (!shippingResponse.ok) {
      console.log(`    Provider ${provider.id} shipping failed: ${shippingResponse.status}`)
      return null
    }

    const shippingData: ShippingData = await shippingResponse.json()
    const shippingCents = getShippingCostForNetherlands(shippingData)

    return {
      providerId: provider.id,
      providerName: provider.title,
      shippingCents,
    }
  } catch (error) {
    console.error(`Error fetching shipping for provider ${provider.id}:`, error)
    return null
  }
}

interface ProviderShippingResult {
  providerId: number
  providerName: string
  shippingCents: number
}

/**
 * Find the provider with cheapest shipping to Netherlands
 * Note: We only compare shipping costs since Printify catalog API doesn't provide variant prices.
 * The product price is assumed to be similar across providers for the same blueprint.
 */
async function findCheapestShippingProvider(
  blueprintId: number,
  currentMinPrice: number,
  apiToken: string
): Promise<{ cheapest: ProviderPricing; allProviders: ProviderPricing[] } | null> {
  const url = `https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers.json`
  console.log(`  Fetching providers from: ${url}`)

  const providersResponse = await fetch(url, {
    headers: { 'Authorization': `Bearer ${apiToken}` }
  })

  if (!providersResponse.ok) {
    const errorText = await providersResponse.text()
    console.log(`  Failed to fetch providers for blueprint ${blueprintId}: ${providersResponse.status} - ${errorText}`)
    return null
  }

  const providers: ProviderInfo[] = await providersResponse.json()
  console.log(`  Found ${providers.length} providers: ${providers.map(p => `${p.title}(${p.id})`).join(', ')}`)

  // Fetch shipping for all providers in parallel
  const shippingPromises = providers.map(provider =>
    getProviderShipping(blueprintId, provider, apiToken)
  )
  const shippingResults = await Promise.all(shippingPromises)

  const validShipping = shippingResults.filter((p): p is ProviderShippingResult => p !== null)
  console.log(`  Valid shipping results: ${validShipping.length} out of ${shippingResults.length}`)

  if (validShipping.length === 0) {
    console.log(`  No providers with valid shipping data`)
    return null
  }

  // Convert to ProviderPricing using current min_price from database
  const pricing: ProviderPricing[] = validShipping.map(s => ({
    providerId: s.providerId,
    providerName: s.providerName,
    minPriceCents: currentMinPrice, // Use existing price from database
    shippingCents: s.shippingCents,
    totalCostCents: currentMinPrice + s.shippingCents,
  }))

  // Sort by shipping cost (since product price is the same for all)
  pricing.sort((a, b) => a.shippingCents - b.shippingCents)

  return {
    cheapest: pricing[0],
    allProviders: pricing
  }
}

/**
 * Sync Cheapest Providers Edge Function
 *
 * Scheduled job that runs periodically (e.g., daily) to:
 * 1. Fetch all active products from catalog_products
 * 2. For each product, query ALL available Printify providers
 * 3. Compare total cost (product price + shipping to Netherlands)
 * 4. Update the database with the cheapest provider's info
 *
 * Updates these fields in catalog_products:
 * - print_provider_id: ID of the cheapest provider
 * - min_price_cents: Minimum variant price from cheapest provider
 * - shipping_cents: Shipping cost to Netherlands from cheapest provider
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    console.log('=== SYNC CHEAPEST PROVIDERS ===')
    console.log('Finding cheapest print providers for Netherlands...')

    // Validate environment variables
    const PRINTIFY_API_TOKEN = validateEnvVars.printifyToken()
    console.log(`Printify token preview: ${PRINTIFY_API_TOKEN.slice(0, 20)}...`)
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!SUPABASE_URL) {
      throw ErrorCodes.SUPABASE_URL_MISSING()
    }
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      throw ErrorCodes.SUPABASE_SERVICE_ROLE_KEY_MISSING()
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get all active products
    const { data: products, error: fetchError } = await supabase
      .from('catalog_products')
      .select('blueprint_id, display_title, print_provider_id, min_price_cents, shipping_cents')
      .eq('is_active', true)

    if (fetchError) {
      throw new Error(`Failed to fetch products: ${fetchError.message}`)
    }

    if (!products || products.length === 0) {
      console.log('No active products found')
      return new Response(
        JSON.stringify({ success: true, message: 'No active products to sync', updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing ${products.length} active products...`)

    const updates: ProductUpdate[] = []
    const errors: { blueprintId: number; error: string }[] = []

    // Process each product
    for (const product of products) {
      console.log(`\nProcessing blueprint ${product.blueprint_id}: ${product.display_title}`)

      try {
        console.log(`\n  Calling findCheapestShippingProvider for blueprint ${product.blueprint_id}...`)
        const result = await findCheapestShippingProvider(
          product.blueprint_id,
          product.min_price_cents || 0,
          PRINTIFY_API_TOKEN
        )
        console.log(`  findCheapestShippingProvider returned: ${result ? 'result found' : 'null'}`)

        if (!result) {
          errors.push({ blueprintId: product.blueprint_id, error: 'No valid providers found' })
          continue
        }

        const { cheapest, allProviders } = result

        // Log top 3 providers for comparison
        console.log('  Provider comparison (sorted by shipping cost to NL):')
        allProviders.slice(0, 3).forEach((p: ProviderPricing, i: number) => {
          const marker = i === 0 ? '→' : ' '
          console.log(`  ${marker} ${i + 1}. ${p.providerName} (${p.providerId}): ` +
            `€${(p.minPriceCents / 100).toFixed(2)} + €${(p.shippingCents / 100).toFixed(2)} shipping = ` +
            `€${(p.totalCostCents / 100).toFixed(2)}`)
        })

        // Check if this is a change from current
        const isChanged =
          product.print_provider_id !== cheapest.providerId ||
          product.min_price_cents !== cheapest.minPriceCents ||
          product.shipping_cents !== cheapest.shippingCents

        if (isChanged) {
          console.log(`  ✓ Updating: Provider ${product.print_provider_id || 'none'} → ${cheapest.providerId}`)

          // Update the product in the database
          const { error: updateError } = await supabase
            .from('catalog_products')
            .update({
              print_provider_id: cheapest.providerId,
              min_price_cents: cheapest.minPriceCents,
              shipping_cents: cheapest.shippingCents,
              updated_at: new Date().toISOString(),
            })
            .eq('blueprint_id', product.blueprint_id)

          if (updateError) {
            errors.push({ blueprintId: product.blueprint_id, error: updateError.message })
            console.log(`  ✗ Update failed: ${updateError.message}`)
          } else {
            updates.push({
              blueprintId: product.blueprint_id,
              displayTitle: product.display_title,
              providerId: cheapest.providerId,
              providerName: cheapest.providerName,
              minPriceCents: cheapest.minPriceCents,
              shippingCents: cheapest.shippingCents,
              totalCostCents: cheapest.totalCostCents,
            })
          }
        } else {
          console.log(`  - No change needed (already using cheapest provider)`)
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        errors.push({ blueprintId: product.blueprint_id, error: errorMsg })
        console.error(`  ✗ Error processing blueprint ${product.blueprint_id}:`, error)
      }
    }

    console.log('\n=== SYNC COMPLETE ===')
    console.log(`Updated: ${updates.length}`)
    console.log(`Errors: ${errors.length}`)

    if (updates.length > 0) {
      console.log('\nUpdated products:')
      updates.forEach(u => {
        console.log(`  - ${u.displayTitle}: ${u.providerName} (${u.providerId}) @ €${(u.totalCostCents / 100).toFixed(2)}`)
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: products.length,
        updated: updates.length,
        errors: errors.length,
        updates: updates.map(u => ({
          blueprint_id: u.blueprintId,
          display_title: u.displayTitle,
          provider_id: u.providerId,
          provider_name: u.providerName,
          min_price_cents: u.minPriceCents,
          shipping_cents: u.shippingCents,
          total_cost_cents: u.totalCostCents,
        })),
        errorDetails: errors,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error syncing cheapest providers:', error)
    return handleError(error, corsHeaders)
  }
})
