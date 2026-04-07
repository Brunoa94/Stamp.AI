import type { OrderWithItemsT } from '@/types/order'

const CANCELLABLE_STATUSES = new Set(['waiting_payment', 'confirmed'])

export function canCancelOrder(order: Pick<OrderWithItemsT, 'status'>): boolean {
  return CANCELLABLE_STATUSES.has(String(order.status || '').toLowerCase())
}

export function canProceedToPayment(order: Pick<OrderWithItemsT, 'status'>): boolean {
  return String(order.status || '').toLowerCase() === 'waiting_payment'
}
