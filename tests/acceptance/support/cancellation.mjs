import { setTimeout as delay } from 'node:timers/promises';

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
