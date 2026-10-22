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
const upgrade = app.getUpgradeHandler();

function listen(port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => handle(req, res));
    server.on('upgrade', (req, socket, head) => upgrade(req, socket, head));
    server.once('error', reject);
    server.listen(port, () => resolve(server));
  });
}

const warmUpServer = await listen(warmUpPort);
process.on('message', async message => {
  if (message !== 'serve') return;
  await listen(publicPort);
  warmUpServer.close();
  warmUpServer.closeAllConnections();
  process.send('serving');
});
process.send('warm-up');
