/**
 * Test Mode Production Safeguard
 *
 * CRITICAL: Prevents test orders from being processed in production,
 * ensuring real customers receive real products.
 */

/**
 * Determine if the current environment is production
 *
 * Checks multiple environment indicators:
 * - DENO_ENV or NODE_ENV set to "production"
 * - SUPABASE_URL contains "supabase.co" (production domain)
 * - IS_PRODUCTION explicitly set to "true"
 */
export function isProductionEnvironment(): boolean {
  const denoEnv = Deno.env.get('DENO_ENV');
  const nodeEnv = Deno.env.get('NODE_ENV');
  const isProduction = Deno.env.get('IS_PRODUCTION');
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';

  // Explicit production flag
  if (isProduction === 'true' || isProduction === '1') {
    return true;
  }

  // Check environment variables
  if (denoEnv === 'production' || nodeEnv === 'production') {
    return true;
  }

  // Check if using production Supabase URL
  if (supabaseUrl.includes('supabase.co') && !supabaseUrl.includes('localhost')) {
    return true;
  }

  return false;
}

/**
 * Validate and enforce test mode settings
 *
 * In production:
 * - Forces is_test = false
 * - Logs critical warning if client sent is_test = true
 * - Returns corrected value
 *
 * In non-production:
 * - Allows any test mode value
 * - Returns client value unchanged
 *
 * @param clientTestMode - Test mode value from client request
 * @param context - Context for logging (e.g., "Printify order", "Stripe payment")
 * @returns Enforced test mode value
 */
export function enforceTestMode(
  clientTestMode: boolean | undefined,
  context: string = 'order'
): boolean {
  const isProd = isProductionEnvironment();

  if (isProd) {
    if (clientTestMode === true) {
      console.error('🚨 CRITICAL: Test mode requested in PRODUCTION environment!');
      console.error(`   Context: ${context}`);
      console.error('   Client requested: is_test = true');
      console.error('   FORCING: is_test = false');
      console.error('   This prevents real customers from receiving test orders!');

      // TODO: Send alert to monitoring system
      // await sendAlert({
      //   severity: 'critical',
      //   message: 'Test mode requested in production',
      //   context,
      // });
    }

    // Always force false in production
    return false;
  }

  // In non-production, allow any value
  const finalTestMode = clientTestMode ?? true; // Default to test in dev
  console.log(`🧪 Test mode: ${finalTestMode} (Environment: non-production)`);

  return finalTestMode;
}

/**
 * Get environment display name for logging
 */
export function getEnvironmentName(): string {
  if (isProductionEnvironment()) {
    return 'PRODUCTION';
  }

  return 'DEVELOPMENT/STAGING';
}

/**
 * Validate test mode configuration and log status
 *
 * @param requestedTestMode - Test mode from client
 * @param context - Context for logging
 * @returns Validated and enforced test mode
 */
export function validateAndEnforceTestMode(
  requestedTestMode: boolean | undefined,
  context: string = 'operation'
): { testMode: boolean; environment: string; wasOverridden: boolean } {
  const isProd = isProductionEnvironment();
  const environment = getEnvironmentName();
  const enforcedTestMode = enforceTestMode(requestedTestMode, context);
  const wasOverridden = isProd && requestedTestMode === true;

  console.log('═══════════════════════════════════════');
  console.log('TEST MODE VALIDATION');
  console.log('═══════════════════════════════════════');
  console.log(`Environment: ${environment}`);
  console.log(`Context: ${context}`);
  console.log(`Requested: is_test = ${requestedTestMode ?? 'undefined'}`);
  console.log(`Enforced: is_test = ${enforcedTestMode}`);
  if (wasOverridden) {
    console.log('⚠️  VALUE WAS OVERRIDDEN FOR SAFETY');
  }
  console.log('═══════════════════════════════════════');

  return {
    testMode: enforcedTestMode,
    environment,
    wasOverridden,
  };
}
