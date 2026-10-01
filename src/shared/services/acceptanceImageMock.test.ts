import { afterEach, describe, expect, it, vi } from 'vitest';
import { acceptanceImageMock } from './acceptanceImageMock';

afterEach(() => vi.unstubAllEnvs());
describe('ENV-03 external AI is mocked only in the authorized acceptance environment', () => {
  it('leaves normal execution untouched', async () => {
    vi.stubEnv('STAMP_ACCEPTANCE_TESTS', '');
    expect(await acceptanceImageMock('design')).toBeUndefined();
  });
  it('rejects an enabled mock on an unknown database', async () => {
    vi.stubEnv('STAMP_ACCEPTANCE_TESTS', '1');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://wrong.supabase.co');
    await expect(acceptanceImageMock('design')).rejects.toThrow('test project');
  });
  it('returns a deterministic image without AI credentials', async () => {
    vi.stubEnv('STAMP_ACCEPTANCE_TESTS', '1');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://tgccxydchvujhrqyzqao.supabase.co');
    vi.stubEnv('OPENAI_API_KEY', '');
    expect(await acceptanceImageMock('design')).toEqual(await acceptanceImageMock('design'));
    expect((await acceptanceImageMock('design'))?.imageUrl).toMatch(/^data:image\/png;base64,/);
  });
  it('can fail after real coin deduction to exercise refunds', async () => {
    vi.stubEnv('STAMP_ACCEPTANCE_TESTS', '1');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://tgccxydchvujhrqyzqao.supabase.co');
    await expect(acceptanceImageMock('[acceptance:fail]')).rejects.toThrow('generation failure');
  });
});
