import http from 'node:http';
import next from 'next';

// Next dev server for warm-up runs (see server.mjs). Next is configured with the public
// port, so request URLs are the same as `next dev --port <public>`, but it first listens
// only on a private port. The parent loads pages there, then asks it to open the public port.
const publicPort = Number(process.env.ACCEPTANCE_PUBLIC_PORT);
const warmUpPort = Number(process.env.ACCEPTANCE_WARM_UP_PORT);

const app = next({ dev: true, webpack: true, hostname: 'localhost', port: publicPort });
await app.prepare();
const handle = app.getRequestHandler();

// One server for both ports. On its first request Next attaches its HMR WebSocket handler
// to that request's server, once; app.getUpgradeHandler() does nothing in dev. A second
// server would never answer the HMR handshake, and in dev the pages it serves never hydrate.
const server = http.createServer((req, res) => handle(req, res));

function listen(port) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, () => {
      server.off('error', reject);
      resolve();
    });
  });
}

await listen(warmUpPort);
process.on('message', async message => {
  if (message !== 'serve') return;
  const closed = new Promise(resolve => server.close(resolve));
  server.closeAllConnections();
  await closed;
  await listen(publicPort);
  process.send('serving');
});
process.send('warm-up');
