// Edge Functions that must refuse an anonymous caller (SEC-02). The offline
// setup boots each one before the specs run (see scripts/acceptance/local-supabase.mjs).
export const ANONYMOUS_GUARDED_FUNCTIONS = ['create-printify-order', 'cancel-order', 'process-refund', 'create-payment-intent', 'create-mollie-payment', 'capture-paypal-order', 'generate-invoice'];
