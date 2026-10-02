import { readFileSync, existsSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { spawn } from 'node:child_process';
import { loadEnvironment } from '../../tests/acceptance/support/environment.mjs';

const testEnv = loadEnvironment();
// Next auto-loads .env.local even when invoked by a test runner. Explicitly blank
// all repository environment keys first so production values cannot fill gaps.
const env = { PATH: process.env.PATH, HOME: process.env.HOME, TMPDIR: process.env.TMPDIR };
for (const file of ['.env', '.env.local', '.env.development', '.env.development.local']) {
  if (existsSync(file)) for (const key of Object.keys(parseEnv(readFileSync(file, 'utf8')))) env[key] = '';
}
Object.assign(env, testEnv, {
  STAMP_ACCEPTANCE_TESTS: '1', NEXT_PUBLIC_SITE_URL: 'http://localhost:3107',
  // One machine drives the whole suite through a single IP.
  RATE_LIMIT_AUTH_MAX: '1000', RATE_LIMIT_IMAGE_GENERATION_MAX: '1000', OPENAI_API_KEY: '', GEMINI_API_KEY: '', GOOGLE_API_KEY: '', GOOGLE_GEMINI_API_KEY: '',
  NEXT_PUBLIC_PRINTIFY_API_TOKEN: '', NODE_ENV: 'development', NEXT_TELEMETRY_DISABLED: '1',
});

// Start Stripe CLI webhook listener if available and payment tests are enabled
const stripeCliPath = process.env.STRIPE_CLI_PATH || 'stripe';
const enableStripeWebhooks = testEnv.TEST_PRINTIFY_MANUAL_APPROVAL === 'confirmed';

let stripeProcess = null;
let nextProcess = null;

async function startStripeListener() {
  return new Promise((resolve, reject) => {
    // The webhook handler is a Supabase Edge Function, not a local route
    const supabaseUrl = testEnv.NEXT_PUBLIC_SUPABASE_URL;
    const webhookUrl = supabaseUrl
      ? `${supabaseUrl}/functions/v1/stripe-webhook`
      : 'localhost:3107/api/stripe/webhook';

    console.log(`[Stripe] Forwarding webhooks to: ${webhookUrl}`);

    // Use API key from environment to avoid stale CLI config
    const args = [
      'listen',
      '--forward-to', webhookUrl,
      '--skip-verify',
    ];
    if (testEnv.STRIPE_SECRET_KEY) {
      args.push('--api-key', testEnv.STRIPE_SECRET_KEY);
    }
    const stripe = spawn(stripeCliPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });

    stripeProcess = stripe;
    let webhookSecret = null;

    const checkForSecret = (output, source) => {
      const match = output.match(/whsec_[a-zA-Z0-9_]+/);
      if (match && !webhookSecret) {
        webhookSecret = match[0];
        console.log(`[Stripe] Captured webhook secret from ${source}: ${webhookSecret.slice(0, 12)}...`);
        resolve(webhookSecret);
        return true;
      }
      return false;
    };

    stripe.stdout.on('data', (data) => {
      const output = data.toString();
      process.stdout.write(`[Stripe] ${output}`);
      checkForSecret(output, 'stdout');
    });

    stripe.stderr.on('data', (data) => {
      const output = data.toString();
      process.stderr.write(`[Stripe] ${output}`);
      checkForSecret(output, 'stderr');
    });

    stripe.on('error', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('[Stripe] CLI not found, skipping webhook forwarding. Payment tests may fail.');
        resolve(null);
      } else {
        reject(err);
      }
    });

    stripe.on('close', (code) => {
      if (!webhookSecret && code !== 0) {
        console.warn(`[Stripe] CLI exited with code ${code}`);
        resolve(null);
      }
    });

    // Timeout after 30 seconds if no secret captured (Stripe CLI can be slow to start)
    setTimeout(() => {
      if (!webhookSecret) {
        console.warn('[Stripe] Timeout waiting for webhook secret after 30s');
        resolve(null);
      }
    }, 30000);
  });
}

async function startNextServer(webhookSecret) {
  const serverEnv = { ...env };
  if (webhookSecret) {
    serverEnv.STRIPE_WEBHOOK_SECRET = webhookSecret;
  }

  nextProcess = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--port', '3107'], { env: serverEnv, stdio: 'inherit' });

  nextProcess.on('exit', code => { process.exitCode = code ?? 1; });
  return nextProcess;
}

function cleanup(signal) {
  if (stripeProcess) stripeProcess.kill(signal);
  if (nextProcess) nextProcess.kill(signal);
}

for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => cleanup(signal));

// Main startup
(async () => {
  // Start Next.js server
  console.log('[Server] Starting Next.js development server...');
  await startNextServer(testEnv.STRIPE_WEBHOOK_SECRET || null);

  // Note: Stripe webhooks are handled by the deployed Supabase Edge Function
  // Configure the webhook endpoint in Stripe Dashboard to point to:
  // https://<supabase-project>.supabase.co/functions/v1/stripe-webhook
  // The Stripe CLI forwarding is disabled since Edge Functions handle webhooks
  if (enableStripeWebhooks) {
    console.log('[Server] Payment tests enabled - webhooks handled by Supabase Edge Function');
  }
})();
