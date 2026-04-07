import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabaseRest } from '../_shared/supabase.ts'
import { handleError } from '../_shared/errors.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  try {
    const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const result = await supabaseRest<any[]>(
      `orders?status=eq.waiting_payment&created_at=lte.${encodeURIComponent(threshold)}&select=id`,
      'PATCH',
      {
        status: 'cancelled',
        cancellation_reason: 'expired',
        expired_at: new Date().toISOString(),
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { prefer: 'return=representation' },
    )

    if (result.error) {
      throw new Error(JSON.stringify(result.error))
    }

    return new Response(
      JSON.stringify({
        success: true,
        expiredCount: result.data?.length ?? 0,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    return handleError(error, corsHeaders)
  }
})
