import { setTimeout as delay } from 'node:timers/promises';

const CANCELED = new Set(['canceled', 'cancelled']);

/**
 * Printify keeps a freshly created order in `pending` for a short while and
 * rejects cancellation until it reaches `on-hold`. Wait for a cancellable
 * state (bounded) before spending the cancellation budget.
 */
async function waitUntilCancellable(read, sleep, evidence, maxPolls = 40) {
  // 40 polls x 3s = 2 minutes of real time; bounded by polls (not the clock)
  // so an injected no-op sleep cannot stall the helper.
  let status = 'unverified';
  for (let poll = 0; poll < maxPolls; poll++) {
    try { status = (await read()).status; } catch { status = 'unverified'; }
    if (status !== 'pending') return status;
    await sleep(3000);
  }
  evidence.push({ phase: 'wait', status, note: 'still pending after wait budget' });
  return status;
}

export async function cancelWithRetry({ cancel, read, sleep = delay }) {
  const evidence = [];
  const initial = await waitUntilCancellable(read, sleep, evidence);
  if (CANCELED.has(initial)) return { attempts: 0, evidence: [{ phase: 'wait', status: initial }] };
  for (let attempt = 1; attempt <= 4; attempt++) {
    let mutation = 'accepted';
    try { await cancel(); } catch { mutation = 'rejected-or-unreachable'; }
    let status = 'unverified';
    try { status = (await read()).status; } catch { /* Never infer cancellation from local state. */ }
    evidence.push({ attempt, mutation, status });
    if (CANCELED.has(status)) return { attempts: attempt, evidence };
    if (attempt < 4) await sleep(3000 * 2 ** (attempt - 1));
  }
  const error = new Error('Printify cancellation unverified after initial attempt and three retries');
  error.attempts = 4;
  error.evidence = evidence;
  throw error;
}
