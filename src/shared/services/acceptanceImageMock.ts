import { isAcceptanceDatabaseUrl } from '@/lib/security/acceptanceDatabase';
import { loadMockImageDataUrl } from './mockImage';

/** External model boundary only: auth, validation and coin accounting stay real. */
export async function acceptanceImageMock(prompt: string): Promise<{
  imageUrl: string;
  enhancedPrompt: string;
} | undefined> {
  if (process.env.STAMP_ACCEPTANCE_TESTS !== '1') return undefined;
  if (!isAcceptanceDatabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    throw new Error('Acceptance AI mock requires the authorized test project');
  }
  if (prompt.includes('[acceptance:fail]')) throw new Error('Acceptance generation failure');
  if (prompt.includes('[acceptance:timeout]')) await new Promise(resolve => setTimeout(resolve, 95_000));
  return { imageUrl: await loadMockImageDataUrl(), enhancedPrompt: `Acceptance fixture: ${prompt}` };
}
