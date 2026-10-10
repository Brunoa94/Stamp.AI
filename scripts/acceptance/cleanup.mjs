import { recoverAccountOrders } from '../../tests/acceptance/support/account-ledger.mjs';
import { loadEnvironment } from '../../tests/acceptance/support/environment.mjs';
import { PrintifyOrders } from '../../tests/acceptance/support/printify.mjs';
const env = loadEnvironment();
// Explicit recovery starts one new budget for existing failures. Account discovery
// may find additional orders, but cannot restart that budget a second time.
try { await new PrintifyOrders(env).cleanup({ recoverFailed: true }); }
catch (error) { console.error(error.message); process.exitCode = 1; }
try { await recoverAccountOrders(env); }
catch (error) { console.error(error.message); process.exitCode = 1; }
