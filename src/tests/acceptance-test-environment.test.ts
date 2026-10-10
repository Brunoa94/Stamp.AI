import { afterEach, describe, expect, it, vi } from 'vitest';
import { isProductionEnvironment, enforceTestMode } from '../../supabase/functions/_shared/testModeSafeguard';

afterEach(() => vi.unstubAllGlobals());
function environment(values: Record<string, string>) {
  vi.stubGlobal('Deno', { env: { get: (key: string) => values[key] } });
}
describe('ENV-02 explicit hosted test environment never disables production protection', () => {
  it('permits sandbox orders on the authorized parallel database even in a production build', () => {
    environment({ APP_ENV: 'test', SUPABASE_URL: 'https://tgccxydchvujhrqyzqao.supabase.co', NODE_ENV: 'production' });
    expect(isProductionEnvironment()).toBe(false);
    expect(enforceTestMode(true)).toBe(true);
  });
  it.each(['https://timbqoxngnhoetbofdiq.supabase.co', 'https://unknown.supabase.co'])('does not whitelist %s using APP_ENV alone', (url) => {
    environment({ APP_ENV: 'test', SUPABASE_URL: url });
    expect(isProductionEnvironment()).toBe(true);
    expect(enforceTestMode(true)).toBe(false);
  });
  it('explicit production declaration wins over test configuration', () => {
    environment({ APP_ENV: 'test', SUPABASE_URL: 'https://tgccxydchvujhrqyzqao.supabase.co', IS_PRODUCTION: 'true' });
    expect(enforceTestMode(true)).toBe(false);
  });
});
