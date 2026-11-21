/**
 * Cache Revalidation API Route
 *
 * Allows manual cache invalidation for Next.js server-side cache.
 * Called by Edge Functions when catalog data changes (price updates, stock changes, etc.)
 *
 * Usage:
 * POST /api/revalidate?tag=products   with `Authorization: Bearer <REVALIDATION_SECRET>`
 * POST /api/revalidate?tag=providers  with `Authorization: Bearer <REVALIDATION_SECRET>`
 *
 * Environment Variables:
 * REVALIDATION_SECRET - Secret key to protect this endpoint
 */

import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { checkBearerSecret } from '@/lib/security/adminSecret'

export async function POST(request: NextRequest) {
  // Verify secret to prevent unauthorized revalidation
  const auth = checkBearerSecret(request, process.env.REVALIDATION_SECRET)

  if (auth === 'unconfigured') {
    return NextResponse.json(
      { error: 'REVALIDATION_SECRET not configured' },
      { status: 500 }
    )
  }

  if (auth === 'unauthorized') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const tag = request.nextUrl.searchParams.get('tag')

  if (!tag) {
    return NextResponse.json({ error: 'Missing tag parameter' }, { status: 400 })
  }

  try {
    // Revalidate the cache for this tag
    // Next.js 16 requires cache config as second parameter
    revalidateTag(tag, {})

    return NextResponse.json({
      revalidated: true,
      tag,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    )
  }
}

// Also support GET for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Cache revalidation endpoint',
    usage: 'POST /api/revalidate?tag=TAG_NAME with Authorization: Bearer <secret>',
    availableTags: ['products', 'providers']
  })
}
