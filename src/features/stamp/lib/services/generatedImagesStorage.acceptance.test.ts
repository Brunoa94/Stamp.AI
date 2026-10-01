import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { addStoredImage, getStoredImages } from './generatedImagesStorage';
const key = 'stamp:generated-images';
const image = (n: number) => ({ imageUrl: `https://example.test/${n}.png`, enhancedPrompt: `Design ${n}`, timestamp: Date.now() });
beforeEach(() => { localStorage.clear(); vi.useFakeTimers(); vi.setSystemTime(new Date('2026-09-28T12:00:00Z')); });
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });
describe('RES-04 RES-05 history acceptance contract', () => {
  it('retains an image exactly at 24 hours and removes it one millisecond later', () => {
    addStoredImage(image(1));
    vi.advanceTimersByTime(86400000);
    expect(getStoredImages()).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(getStoredImages()).toEqual([]);
    expect(JSON.parse(localStorage.getItem(key)!).entries).toEqual([]);
  });
  it('retains only the newest twenty entries in newest-first order', () => {
    for (let n = 1; n <= 21; n++) addStoredImage(image(n));
    expect(getStoredImages().map(i => i.imageUrl)).toEqual(Array.from({ length: 20 }, (_, i) => `https://example.test/${21-i}.png`));
  });
  it.each(['invalid json', '{"entries":null}', '{"entries":[null]}'])('recovers from malformed history: %s', value => {
    localStorage.setItem(key, value);
    expect(getStoredImages()).toEqual([]);
  });
  it('storage quota failure does not turn a successful generation into an exception', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Full', 'QuotaExceededError'); });
    expect(() => addStoredImage(image(1))).not.toThrow();
  });
});
