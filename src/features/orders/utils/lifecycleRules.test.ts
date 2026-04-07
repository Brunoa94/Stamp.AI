import { canCancelOrder, canProceedToPayment } from './lifecycleRules'

describe('order lifecycle rules', () => {
  it('allows cancellation for waiting_payment', () => {
    expect(canCancelOrder({ status: 'waiting_payment' } as any)).toBe(true)
  })

  it('allows cancellation for confirmed', () => {
    expect(canCancelOrder({ status: 'confirmed' } as any)).toBe(true)
  })

  it('blocks cancellation for in_production', () => {
    expect(canCancelOrder({ status: 'in_production' } as any)).toBe(false)
  })

  it('shows proceed to payment only for waiting_payment', () => {
    expect(canProceedToPayment({ status: 'waiting_payment' } as any)).toBe(true)
    expect(canProceedToPayment({ status: 'confirmed' } as any)).toBe(false)
    expect(canProceedToPayment({ status: 'cancelled' } as any)).toBe(false)
  })
})
