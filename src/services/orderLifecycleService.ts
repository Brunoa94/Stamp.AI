import { createClient } from '@/lib/supabase/client'
import { ErrorClient } from './errorClient'

interface CancelOrderResponseI {
  success: boolean
  status: 'cancelled' | 'refund_failed'
}

export class OrderLifecycleService {
  private static getSupabase() {
    return createClient()
  }

  static async cancelOrder(orderId: string): Promise<CancelOrderResponseI> {
    try {
      const { data, error } = await this.getSupabase().functions.invoke('cancel-order', {
        body: { orderId },
      })

      if (error) {
        throw ErrorClient.handleError({ error, service: 'OrderLifecycle', action: 'Cancel Order' })
      }

      return {
        success: Boolean(data?.success),
        status: data?.status === 'refund_failed' ? 'refund_failed' : 'cancelled',
      }
    } catch (error) {
      throw ErrorClient.handleError({ error, service: 'OrderLifecycle', action: 'Cancel Order' })
    }
  }
}
