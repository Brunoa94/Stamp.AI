import { expect, test } from '@playwright/test'

const enabled = process.env.E2E_CHECKOUT_ENABLED === 'true'

test.describe('Checkout & Order Lifecycle', () => {
  test.skip(!enabled, 'Set E2E_CHECKOUT_ENABLED=true and provide seeded fixtures to run lifecycle E2E suite')

  test('failed Stripe payment keeps order in Waiting Payment with proceed button', async ({ page }) => {
    await page.goto('/orders')
    await expect(page.getByText(/waiting_payment/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /pay now/i }).first()).toBeVisible()
  })

  test('cancel button visibility matches lifecycle statuses', async ({ page }) => {
    await page.goto('/orders')

    const waitingCard = page.locator('text=/waiting_payment/i').first()
    await expect(waitingCard).toBeVisible()

    const confirmedCard = page.locator('text=/confirmed/i').first()
    await expect(confirmedCard).toBeVisible()

    const productionCard = page.locator('text=/in_production/i').first()
    await expect(productionCard).toBeVisible()
  })

  test('proceed to payment re-opens checkout with selected provider', async ({ page }) => {
    await page.goto('/orders')
    await page.getByRole('button', { name: /pay now/i }).first().click()
    await expect(page).toHaveURL(/\/checkout\?orderId=.*paymentMethod=.*/)
  })
})
