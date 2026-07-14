/**
 * Add UPDATE policy for payment_transactions
 *
 * Users need to be able to update their own payment transactions
 * to link them to orders after order creation via linkPaymentTransactionToOrder.
 * Without this policy, the frontend call silently fails due to RLS.
 */

-- Allow users to update their own payment transactions
CREATE POLICY "Users can update their own payment transactions" ON payment_transactions
    FOR UPDATE USING (auth.uid() = user_id);
