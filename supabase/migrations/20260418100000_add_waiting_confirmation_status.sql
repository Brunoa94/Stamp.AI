-- =====================================================
-- Add 'waiting_confirmation' Order Status
-- Created: 2026-04-18
-- Description: Separates payment received from fulfillment confirmation
--              Flow: pending → waiting_confirmation (payment received)
--                    → confirmed (Printify created) or unsuccessful_confirmation (Printify failed)
-- =====================================================

-- Drop existing check constraint
ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS check_valid_order_status;

-- Add new check constraint with 'waiting_confirmation' and 'unsuccessful_confirmation' statuses
ALTER TABLE orders
  ADD CONSTRAINT check_valid_order_status
  CHECK (status IN ('pending', 'waiting_confirmation', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'unsuccessful_confirmation'));

COMMENT ON CONSTRAINT check_valid_order_status ON orders IS
  'Valid order statuses:
   - pending: Order created, awaiting payment
   - waiting_confirmation: Payment received, awaiting Printify order creation
   - confirmed: Payment received and Printify order created successfully
   - processing: Printify is manufacturing
   - shipped: Product shipped to customer
   - delivered: Product delivered
   - cancelled: Order cancelled by customer or system
   - unsuccessful_confirmation: Printify order creation failed, refund processed';

-- Update the atomic function to accept the new statuses
DROP FUNCTION IF EXISTS update_order_payment_status_atomic(UUID, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION update_order_payment_status_atomic(
  p_order_id UUID,
  p_payment_status TEXT,
  p_order_status TEXT DEFAULT NULL,
  p_payment_method TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Validate payment_status value
  IF p_payment_status NOT IN ('pending', 'paid', 'failed', 'refunded', 'canceled') THEN
    RAISE EXCEPTION 'Invalid payment_status: %', p_payment_status;
  END IF;

  -- Validate order_status if provided
  IF p_order_status IS NOT NULL AND
     p_order_status NOT IN ('pending', 'waiting_confirmation', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'unsuccessful_confirmation') THEN
    RAISE EXCEPTION 'Invalid order_status: %', p_order_status;
  END IF;

  -- ATOMIC OPERATION: Update order
  -- Only update order_status if explicitly provided
  IF p_order_status IS NOT NULL THEN
    UPDATE orders
    SET payment_status = p_payment_status,
        status = p_order_status,
        payment_method = COALESCE(p_payment_method, payment_method),
        updated_at = NOW()
    WHERE id = p_order_id;
  ELSE
    -- Only update payment_status and payment_method
    UPDATE orders
    SET payment_status = p_payment_status,
        payment_method = COALESCE(p_payment_method, payment_method),
        updated_at = NOW()
    WHERE id = p_order_id;
  END IF;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found: %', p_order_id;
  END IF;

  v_result = jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'payment_status', p_payment_status,
    'status_updated', p_order_status IS NOT NULL
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Atomic order status update failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_order_payment_status_atomic IS
  'Atomically updates payment_status and optionally status for an order.
   Webhooks should set status to waiting_confirmation after payment.
   create-printify-order edge function should update to confirmed or unsuccessful_confirmation.';

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_order_payment_status_atomic TO authenticated, service_role;
