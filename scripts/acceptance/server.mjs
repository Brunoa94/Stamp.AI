import { readFileSync, existsSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { spawn } from 'node:child_process';
import { createServerClient } from '@supabase/ssr';
import { loadEnvironment } from '../../tests/acceptance/support/environment.mjs';

const PORT = 3107;
// CI starts every acceptance group on a cold dev server, and the first page of a
// group can take longer to compile than the tests wait. With ACCEPTANCE_WARM_UP=1,
// next-server.mjs runs Next configured for PORT but listening only on WARM_UP_PORT;
// the pages the specs visit are loaded there, and only then does the same Next
// instance open PORT, so Playwright starts on a warm server.
const WARM_UP = process.env.ACCEPTANCE_WARM_UP === '1';
const WARM_UP_PORT = 3117;
const WARM_UP_ROUTES = ['/', '/catalog', '/stamp', '/cart', '/checkout', '/orders', '/profile', '/reset-password', '/acceptance-warm-up-not-found'];
// Playwright waits 120s for PORT; leave room for the slowest Next boot.
const WARM_UP_BUDGET_MS = 85000;

const testEnv = loadEnvironment();
// Next auto-loads .env.local even when invoked by a test runner. Explicitly blank
// all repository environment keys first so production values cannot fill gaps.
const env = { PATH: process.env.PATH, HOME: process.env.HOME, TMPDIR: process.env.TMPDIR };
for (const file of ['.env', '.env.local', '.env.development', '.env.development.local']) {
  if (existsSync(file)) for (const key of Object.keys(parseEnv(readFileSync(file, 'utf8')))) env[key] = '';
}
Object.assign(env, testEnv, {
  STAMP_ACCEPTANCE_TESTS: '1', NEXT_PUBLIC_STAMP_ACCEPTANCE_TESTS: '1', NEXT_PUBLIC_SITE_URL: 'http://localhost:3107', OPENAI_API_KEY: '', GEMINI_API_KEY: '', GOOGLE_API_KEY: '', GOOGLE_GEMINI_API_KEY: '',
  NEXT_PUBLIC_PRINTIFY_API_TOKEN: '', NODE_ENV: 'development', NEXT_TELEMETRY_DISABLED: '1', NEXT_DIST_DIR: '.next-webpack',
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

  nextProcess = WARM_UP
    ? spawn(process.execPath, ['scripts/acceptance/next-server.mjs'], {
      env: { ...serverEnv, ACCEPTANCE_PUBLIC_PORT: String(PORT), ACCEPTANCE_WARM_UP_PORT: String(WARM_UP_PORT) },
      stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
    })
    : spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--webpack', '--port', String(PORT)], { env: serverEnv, stdio: 'inherit' });

  nextProcess.on('exit', code => { process.exitCode = code ?? 1; });
  return nextProcess;
}

// Resolves with the next IPC message from next-server.mjs, or null once the deadline passes.
function nextMessage(deadline) {
  return new Promise(resolve => {
    const timer = setTimeout(() => resolve(null), Math.max(0, deadline - Date.now()));
    nextProcess.once('message', message => {
      clearTimeout(timer);
      resolve(message);
    });
  });
}

// Session cookies for the supplied test user, so protected pages render instead of redirecting.
async function sessionCookies() {
  const jar = new Map();
  const auth = createServerClient(testEnv.NEXT_PUBLIC_SUPABASE_URL, testEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: { getAll: () => [...jar].map(([name, value]) => ({ name, value })), setAll: values => values.forEach(({ name, value }) => jar.set(name, value)) },
  });
  const { error } = await auth.auth.signInWithPassword({ email: testEnv.TEST_USER_EMAIL, password: testEnv.TEST_USER_PASSWORD });
  if (error) throw new Error(`warm-up login failed (${error.code ?? error.status})`);
  return [...jar].map(([name, value]) => ({ name, value, domain: 'localhost', path: '/', sameSite: 'Lax' }));
}

// Loads each page in a real browser so both the server and the client bundles compile.
// Progress goes to stderr: Playwright only shows the web server's stderr.
async function warmUp(deadline) {
  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext();
    await context.addCookies(await sessionCookies()).catch(error => console.warn(`[Warm-up] Continuing signed out: ${error.message}`));
    const page = await context.newPage();
    for (const route of WARM_UP_ROUTES) {
      const remaining = deadline - Date.now();
      if (remaining < 5000) {
        console.warn(`[Warm-up] Budget spent; ${route} and later pages compile on first use`);
        break;
      }
      const started = Date.now();
      await page.goto(`http://localhost:${WARM_UP_PORT}${route}`, { waitUntil: 'load', timeout: remaining })
        .then(() => page.waitForLoadState('networkidle', { timeout: Math.max(1000, Math.min(10000, deadline - Date.now())) }))
        .catch(error => console.warn(`[Warm-up] ${route}: ${error.message.split('\n')[0]}`));
      console.warn(`[Warm-up] ${route} ready in ${Date.now() - started}ms`);
    }
  } finally {
    await browser.close();
  }
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
  const deadline = Date.now() + WARM_UP_BUDGET_MS;
  await startNextServer(testEnv.STRIPE_WEBHOOK_SECRET || null);

  if (WARM_UP) {
    if (await nextMessage(deadline) === 'warm-up') {
      await warmUp(deadline).catch(error => console.warn(`[Warm-up] Skipped the rest: ${error.message}`));
    } else {
      console.warn('[Warm-up] Next was not ready in time; serving cold');
    }
    if (nextProcess.connected) {
      nextProcess.send('serve');
      await nextMessage(Date.now() + 30000);
      console.warn(`[Warm-up] Serving http://localhost:${PORT}`);
    }
  }

  // Note: Stripe webhooks are handled by the deployed Supabase Edge Function
  // Configure the webhook endpoint in Stripe Dashboard to point to:
  // https://<supabase-project>.supabase.co/functions/v1/stripe-webhook
  // The Stripe CLI forwarding is disabled since Edge Functions handle webhooks
  if (enableStripeWebhooks) {
    console.log('[Server] Payment tests enabled - webhooks handled by Supabase Edge Function');
  }
})();
