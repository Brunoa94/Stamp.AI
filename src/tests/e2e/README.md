# E2E Testing Guide

This directory contains end-to-end (E2E) tests that verify the complete user journey through the application, from image upload to order completion with real database writes.

## Test Coverage

### Complete User Journey Tests
**File**: [complete-user-journey.e2e.spec.ts](./complete-user-journey.e2e.spec.ts)

Tests the full application flow:
1. **Image Upload** - User uploads a custom image
2. **AI Generation** (optional) - Generate AI-enhanced designs
3. **Product Selection** - Choose product type (T-Shirt, etc.)
4. **Product Creation** - Create custom product with design
5. **Add to Cart** - Add product to shopping cart
6. **Cart Review** - View cart and proceed to checkout
7. **Checkout** - Fill shipping address
8. **Payment** - Complete payment with:
   - Stripe (credit card)
   - PayPal (sandbox)
   - Mollie (test mode)
9. **Order Confirmation** - Verify order created successfully

### Data Integrity Tests
**File**: [data-integrity.e2e.spec.ts](./data-integrity.e2e.spec.ts)

Tests that verify database constraints and atomic operations:
- Duplicate prevention
- Foreign key integrity
- Price snapshotting
- Atomic order creation
- Transaction rollback on errors

## Prerequisites

### 1. Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Test User Credentials
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=your_test_password

# Payment Provider Test Credentials
# Stripe (use test mode keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# PayPal (sandbox credentials)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_TEST_EMAIL=sb-test@personal.example.com
PAYPAL_TEST_PASSWORD=test_password

# Mollie (test mode)
NEXT_PUBLIC_MOLLIE_PROFILE_ID=pfl_test_...
MOLLIE_API_KEY=test_...
```

### 2. Database Setup

The tests write to the **real database**, so ensure:

1. **Local Development**:
   ```bash
   supabase start
   supabase db push
   ```

2. **Remote Database**:
   ```bash
   # Tests will use the linked remote database
   # Make sure you're OK with test data being written
   ```

### 3. Test User Setup

Create a test user in Supabase:

```sql
-- Create test user (run in Supabase SQL editor)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'test@example.com',
  crypt('your_test_password', gen_salt('bf')),
  now(),
  now(),
  now()
);
```

Or use the Supabase dashboard to create a test user.

### 4. Payment Provider Setup

#### Stripe
1. Get test API keys from https://dashboard.stripe.com/test/apikeys
2. Use test card: `4242 4242 4242 4242`

#### PayPal
1. Create a sandbox account at https://developer.paypal.com/
2. Create test buyer and seller accounts
3. Use sandbox credentials in tests

#### Mollie
1. Get test API key from https://www.mollie.com/dashboard/developers/api-keys
2. Tests will use Mollie's test mode automatically

## Running Tests

### Run All E2E Tests
```bash
npm run test:e2e
```

### Run Specific Test File
```bash
npx playwright test src/tests/e2e/complete-user-journey.e2e.spec.ts
```

### Run Specific Test Suite
```bash
npx playwright test src/tests/e2e/complete-user-journey.e2e.spec.ts -g "Stripe Payment"
```

### Run in Headed Mode (see browser)
```bash
npx playwright test --headed
```

### Run with Debug
```bash
npx playwright test --debug
```

### Run and Generate Report
```bash
npm run test:e2e
npx playwright show-report
```

## Test Structure

### Page Object Pattern

Tests use helper functions to encapsulate page interactions:

```typescript
// Example: Upload image
await uploadImage(page, TEST_IMAGE_PATH);

// Example: Complete checkout
await proceedToCheckout(page);
await fillShippingAddress(page);
await completeStripePayment(page);
```

### Database Verification

Tests verify data integrity by querying the database directly:

```typescript
const supabase = getSupabaseClient();

// Verify cart items
const { data: cartItems } = await supabase
  .from("cart_items")
  .select("*")
  .like("product_name", `%${testId}%`);

expect(cartItems?.length).toBeGreaterThan(0);
expect(cartItems?.[0].unit_price).toBeGreaterThan(0);
```

### Test Data Cleanup

Each test automatically cleans up its data:

```typescript
test.afterAll(async () => {
  await cleanupTestData(testId);
});
```

## Test Scenarios

### Scenario 1: Stripe Payment Flow
1. User uploads custom image
2. Creates T-Shirt product
3. Adds to cart
4. Proceeds to checkout
5. Fills shipping address
6. Pays with Stripe test card
7. Receives order confirmation

**Verifies**:
- Product created in database
- Cart item with correct price
- Order created with status "completed"
- Payment status "paid"
- Order items match cart items

### Scenario 2: PayPal Payment Flow
Same as Scenario 1, but:
- Redirects to PayPal sandbox
- Logs in with test account
- Completes PayPal payment
- Redirects back to site

**Verifies**:
- Payment provider is "paypal"
- External payment ID captured

### Scenario 3: Mollie Payment Flow
Same as Scenario 1, but:
- Redirects to Mollie test environment
- Clicks "Paid" button (test mode)
- Redirects back to site

**Verifies**:
- Payment provider is "mollie"
- Payment status updated correctly

### Scenario 4: Data Integrity
Comprehensive verification of:
- Product → Cart Item relationship
- Cart Item → Order Item relationship
- Price consistency (unit_price × quantity = total_price)
- No orphaned records
- Foreign key constraints enforced

## Debugging Failed Tests

### View Test Report
```bash
npx playwright show-report
```

### Screenshots
Failed tests automatically capture screenshots:
- Location: `test-results/`
- View in HTML report

### Videos
Test execution videos (on failure):
- Location: `test-results/`
- View in HTML report

### Trace Files
Detailed execution traces:
```bash
npx playwright show-trace test-results/trace.zip
```

### Check Database State
```sql
-- Find test data
SELECT * FROM products WHERE name LIKE '%e2e-%';
SELECT * FROM cart_items WHERE product_name LIKE '%e2e-%';
SELECT * FROM orders WHERE order_number LIKE '%e2e-%';

-- Clean up manually if needed
DELETE FROM order_items WHERE product_name LIKE '%e2e-%';
DELETE FROM orders WHERE order_number LIKE '%e2e-%';
DELETE FROM cart_items WHERE product_name LIKE '%e2e-%';
DELETE FROM products WHERE name LIKE '%e2e-%';
```

## Common Issues

### Issue: "Missing Supabase credentials"
**Solution**: Ensure `.env.local` has `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

### Issue: "Authentication failed"
**Solution**:
1. Check `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` in `.env.local`
2. Verify test user exists in Supabase Auth

### Issue: "Payment failed"
**Solution**:
1. **Stripe**: Use test card `4242 4242 4242 4242`
2. **PayPal**: Check sandbox credentials
3. **Mollie**: Ensure test API key is set

### Issue: "Database constraint violation"
**Solution**:
1. Clean up old test data (see SQL above)
2. Ensure migrations are applied: `supabase db push`

### Issue: "Element not found"
**Solution**:
1. Run in headed mode to see UI: `--headed`
2. Check if UI has changed (update selectors)
3. Increase timeout if loading is slow

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
        run: npm run test:e2e

      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Best Practices

1. **Use Unique Test IDs**: Each test uses a unique ID to avoid conflicts
   ```typescript
   const testId = `e2e-${Date.now()}-stripe`;
   ```

2. **Clean Up After Tests**: Always remove test data in `afterAll`
   ```typescript
   test.afterAll(async () => {
     await cleanupTestData(testId);
   });
   ```

3. **Verify Database State**: Don't just check UI - verify actual data
   ```typescript
   const { data } = await supabase.from("orders").select("*").single();
   expect(data?.status).toBe("completed");
   ```

4. **Use Realistic Test Data**: Mirror production data patterns
   ```typescript
   unit_price: 2500, // $25.00 in cents (realistic price)
   ```

5. **Test Idempotency**: Verify operations can be safely retried
   ```typescript
   // Add same item twice - should update quantity, not duplicate
   await addToCart(page);
   await addToCart(page);
   ```

## Contributing

When adding new E2E tests:

1. Follow existing patterns (helper functions, database verification)
2. Use unique test IDs to avoid conflicts
3. Clean up test data in `afterAll`
4. Add documentation to this README
5. Ensure tests work in CI environment

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Supabase Testing Guide](https://supabase.com/docs/guides/testing)
- [Stripe Testing](https://stripe.com/docs/testing)
- [PayPal Sandbox](https://developer.paypal.com/tools/sandbox/)
- [Mollie Testing](https://docs.mollie.com/overview/testing)
