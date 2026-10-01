import { mkdirSync, readFileSync, readdirSync, writeFileSync, renameSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { required, SHOP_ID } from './environment.mjs';
import { cancelWithRetry } from './cancellation.mjs';

export const LEDGER_DIR = '.acceptance/printify';
export class PrintifyOrders {
  constructor(env, owner) { this.env = env; this.owner = owner; }
  async request(path, method = 'GET', body) {
    if (path.includes('send_to_production') || path.includes('express.json')) throw new Error('Production submission forbidden in acceptance tests');
    const response = await fetch(`https://api.printify.com/v1/shops/${SHOP_ID}/${path}`, {
      method, signal: AbortSignal.timeout(10000),
      headers: { Authorization: `Bearer ${required(this.env, 'PRINTIFY_API_TOKEN')}`, 'Content-Type': 'application/json', 'User-Agent': 'StampAI-Acceptance' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) throw new Error(`Printify ${method} failed (${response.status})`);
    return response.json();
  }
  save(record) {
    mkdirSync(LEDGER_DIR, { recursive: true });
    const file = `${LEDGER_DIR}/${record.externalId}.json`;
    writeFileSync(`${file}.tmp`, JSON.stringify(record, null, 2), { mode: 0o600, flush: true });
    renameSync(`${file}.tmp`, file);
  }
  records() {
    mkdirSync(LEDGER_DIR, { recursive: true });
    return readdirSync(LEDGER_DIR).filter(f => f.endsWith('.json')).map(f => JSON.parse(readFileSync(`${LEDGER_DIR}/${f}`, 'utf8')))
      .filter(r => !this.owner || r.owner === this.owner);
  }
  async create(payload) {
    if (this.env.TEST_PRINTIFY_MANUAL_APPROVAL !== 'confirmed') throw new Error('Missing TEST_PRINTIFY_MANUAL_APPROVAL=confirmed: verify the test shop uses manual approval before ordering');
    const externalId = `stamp-acceptance-${randomUUID()}`;
    const record = { externalId, shopId: SHOP_ID, owner: this.owner, state: 'creating', createdAt: new Date().toISOString() };
    this.save(record); // Persist intent BEFORE the request: lost responses remain recoverable.
    const result = await this.request('orders.json', 'POST', { ...payload, external_id: externalId, send_shipping_notification: false });
    if (!result.id) throw new Error('Printify creation returned no order ID; ledger retained');
    record.orderId = result.id;
    record.state = 'created';
    this.save(record);
    return result;
  }
  registerApplicationIntent(applicationOrderId) {
    if (!/^[a-zA-Z0-9-]+$/.test(applicationOrderId)) throw new Error('Invalid application order identifier');
    if (this.records().some(r => r.applicationOrderId === applicationOrderId)) return;
    this.save({ externalId: `stamp-acceptance-${randomUUID()}`, applicationOrderId, shopId: SHOP_ID, owner: this.owner, state: 'creating', createdAt: new Date().toISOString() });
  }
  register(orderId) {
    if (!orderId || this.records().some(r => r.orderId === orderId)) return;
    this.save({ externalId: `stamp-acceptance-${randomUUID()}`, shopId: SHOP_ID, owner: this.owner, orderId, state: 'created', createdAt: new Date().toISOString() });
  }
  async reconcile(record) {
    if (record.orderId) return [record.orderId];
    const found = [];
    let page = 1;
    for (;;) {
      const data = await this.request(`orders.json?page=${page}&limit=100`);
      for (const order of data.data ?? []) {
        if (order.external_id === record.externalId || order.metadata?.shop_order_id === record.externalId || (record.applicationOrderId && (order.label === record.applicationOrderId || order.metadata?.shop_order_label === record.applicationOrderId))) found.push(order.id);
      }
      if (!data.next_page_url && page >= (data.last_page ?? 1)) break;
      if (++page > 1000) throw new Error('Order reconciliation pagination limit exceeded');
    }
    // No result after an ambiguous creation is NOT evidence no order was created.
    if (!found.length) throw new Error(`Unresolved creation intent ${record.externalId}; investigate provider before clearing ledger`);
    return found;
  }
  async cleanup({ recoverFailed = false } = {}) {
    const failures = [];
    const records = this.records();
    const outcomes = new Map();
    if (!recoverFailed) for (const record of records) {
      if (record.state === 'canceled') continue;
      for (const result of record.cancellations ?? []) if (result.failed) outcomes.set(result.id, result);
    }
    for (const record of records.filter(r => r.state !== 'canceled')) {
      if (record.state === 'cleanup-failed' && !recoverFailed) {
        failures.push(`${record.externalId}: previous cleanup failed; automatic retry budget exhausted. Use the explicit recovery command.`);
        continue;
      }
      try {
        const ids = await this.reconcile(record);
        record.orderIds = ids;
        this.save(record);
        record.cleanupHistory ??= [];
        if (record.cancellations?.length) record.cleanupHistory.push(record.cancellations);
        record.cancellations = [];
        for (const id of ids) {
          try {
            const previous = outcomes.get(id);
            if (previous?.failed) throw Object.assign(new Error('Previous cancellation budget exhausted'), previous);
            const evidence = previous ?? await cancelWithRetry({
              cancel: () => this.request(`orders/${encodeURIComponent(id)}/cancel.json`, 'POST'),
              read: () => this.request(`orders/${encodeURIComponent(id)}.json`),
            });
            outcomes.set(id, { id, ...evidence });
            record.cancellations.push({ id, ...evidence });
          } catch (error) {
            failures.push(`${id}: ${error.message}`);
            record.hadCleanupFailure = true;
            const evidence = { id, failed: true, attempts: error.attempts, evidence: error.evidence };
            outcomes.set(id, evidence);
            record.cancellations.push(evidence);
          }
          this.save(record);
        }
        record.state = record.cancellations.some(r => r.failed) ? 'cleanup-failed' : 'canceled';
        this.save(record);
      } catch (error) {
        record.state = 'cleanup-failed'; this.save(record);
        failures.push(`${record.externalId}: ${error.message}`);
      }
    }
    if (failures.length) throw new Error(`Mandatory Printify cleanup failed:\n${failures.join('\n')}`);
  }
}
