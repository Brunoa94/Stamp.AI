import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { setTimeout as delay } from 'node:timers/promises';
import { required, TEST_URL } from './environment.mjs';

/** Read only messages sent to this run's unique address; never delete inbox mail. */
export async function waitForEmailLink(env, recipient, since, path = '/auth/confirm') {
  const imap = new ImapFlow({
    host: required(env, 'TEST_IMAP_HOST'), port: Number(env.TEST_IMAP_PORT || 993), secure: true,
    auth: { user: required(env, 'TEST_IMAP_USER'), pass: required(env, 'TEST_IMAP_PASSWORD') },
    logger: false, connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 15000,
  });
  try {
    await imap.connect();
    await imap.mailboxOpen(env.TEST_IMAP_FOLDER || 'INBOX', { readOnly: true });
    const deadline = Date.now() + 60000;
    while (Date.now() < deadline) {
      const uids = await imap.search({ to: recipient, since: new Date(since) }, { uid: true });
      for (const uid of (uids || []).slice(-20).reverse()) {
        const message = await imap.fetchOne(uid, { source: true, internalDate: true }, { uid: true });
        if (!message || +message.internalDate < since - 1000) continue;
        const parsed = await simpleParser(message.source);
        const recipients = [parsed.to].flat().filter(Boolean).flatMap(a => a.value).map(a => a.address?.toLowerCase());
        if (!recipients.includes(recipient.toLowerCase())) continue;
        const text = `${parsed.html || ''}\n${parsed.text || ''}`.replaceAll('&amp;', '&');
        const urls = text.match(/https?:\/\/[^\s<>"']+/g) ?? [];
        for (const raw of urls) {
          const url = new URL(raw);
          if (url.pathname !== path) continue;
          if (![TEST_URL, 'http://localhost:3107'].includes(url.origin)) throw new Error('Emailed auth link targets an unexpected environment');
          const redirect = url.searchParams.get('redirect_to');
          if (redirect && new URL(redirect).origin !== 'http://localhost:3107') throw new Error('Emailed recovery redirect is not the test app');
          return url.toString();
        }
      }
      await delay(2000);
    }
    throw new Error('No matching confirmation/recovery email received within 60 seconds');
  } finally { await imap.logout().catch(() => {}); }
}
