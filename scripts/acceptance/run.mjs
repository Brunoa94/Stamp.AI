import { recoverAccountOrders } from '../../tests/acceptance/support/account-ledger.mjs';
import { spawn } from 'node:child_process';
import { preflight } from './preflight.mjs';
import { PrintifyOrders } from '../../tests/acceptance/support/printify.mjs';
let env;
let child;
try {
  env = await preflight();
  child = spawn(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', '--config=playwright.acceptance.config.mjs', ...process.argv.slice(2)], { stdio: 'inherit', detached: process.platform !== 'win32' });
  for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => {
    if (process.platform !== 'win32') { try { process.kill(-child.pid, signal); } catch {} }
    else child.kill(signal);
  });
  const code = await new Promise(resolve => child.on('exit', (code) => resolve(code ?? 1)));
  process.exitCode = code;
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally {
  if (child && process.platform !== 'win32') { try { process.kill(-child.pid, 'SIGTERM'); } catch {} }
  if (env) {
    try { await recoverAccountOrders(env); }
    catch (error) { console.error(error.message); process.exitCode = 1; }
    try { await new PrintifyOrders(env).cleanup(); }
    catch (error) { console.error(error.message); process.exitCode = 1; }
  }
}
