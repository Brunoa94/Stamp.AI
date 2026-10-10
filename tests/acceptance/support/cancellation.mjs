import { setTimeout as delay } from 'node:timers/promises';

// Printify accepts cancellation only after its asynchronous cost calculation
// reaches on-hold (or payment-not-received). Waiting here does not spend a
// cancellation attempt from the fixed four-attempt budget below.
export async function waitForCancelableStatus({ read, sleep = delay, maxPolls = 45 }) {
  let status = 'unverified';
  for (let poll = 1; poll <= maxPolls; poll++) {
    try { status = (await read()).status; } catch { status = 'unverified'; }
    if (['on-hold', 'payment-not-received', 'canceled', 'cancelled'].includes(status)) return status;
    if (['sending-to-production', 'in-production', 'fulfilled'].includes(status)) {
      throw new Error(`Printify order is no longer cancelable (${status})`);
    }
    if (poll < maxPolls) await sleep(2000);
  }
  throw new Error(`Printify order did not reach a cancelable status (${status})`);
}

export async function cancelWithRetry({ cancel, read, sleep = delay }) {
  const evidence = [];
  for (let attempt = 1; attempt <= 4; attempt++) {
    let mutation = 'accepted';
    try { await cancel(); } catch { mutation = 'rejected-or-unreachable'; }
    let status = 'unverified';
    try { status = (await read()).status; } catch { /* Never infer cancellation from local state. */ }
    evidence.push({ attempt, mutation, status });
    if (status === 'canceled' || status === 'cancelled') return { attempts: attempt, evidence };
    if (attempt < 4) await sleep(1000 * 2 ** (attempt - 1));
  }
  const error = new Error('Printify cancellation unverified after initial attempt and three retries');
  error.attempts = 4;
  error.evidence = evidence;
  throw error;
}
