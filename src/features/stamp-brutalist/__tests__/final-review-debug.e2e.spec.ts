import { test, expect } from '@playwright/test';

test.describe('Final Review Image Debug', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should debug final review image data', async ({ page }) => {
    // Capture console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      console.log('BROWSER:', text);
    });

    await page.goto('/create-v2', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('\n=== NAVIGATING TO FINAL REVIEW ===');

    // Navigate to step 7 directly
    await page.evaluate(() => {
      const step7Section = document.getElementById('step-7');
      if (step7Section) {
        // Force activate step 7
        const allSections = document.querySelectorAll('.stamp-section');
        allSections.forEach(s => s.classList.remove('active-section'));
        step7Section.classList.add('active-section');
      }
    });

    await page.waitForTimeout(1000);

    // Get form state
    const formState = await page.evaluate(() => {
      // Try to access React form state through window
      const sections = document.querySelectorAll('.stamp-section');
      const step7 = document.getElementById('step-7');

      return {
        step7Exists: !!step7,
        step7HasActiveClass: step7?.classList.contains('active-section'),
        allSectionsCount: sections.length,
      };
    });

    console.log('\nForm state:', formState);

    // Wait for any FinalReviewCard debug logs
    await page.waitForTimeout(2000);

    // Look for the debug log
    const debugLog = consoleLogs.find(log => log.includes('[FinalReviewCard] Debug:'));

    console.log('\n=== FINAL REVIEW CARD DEBUG LOG ===');
    if (debugLog) {
      console.log(debugLog);

      // Try to parse the debug object
      try {
        const jsonMatch = debugLog.match(/\{.*\}/);
        if (jsonMatch) {
          const debugData = JSON.parse(jsonMatch[0]);
          console.log('\nParsed debug data:');
          console.log('  createdProductId:', debugData.createdProductId);
          console.log('  hasProduct:', debugData.hasProduct);
          console.log('  imagesCount:', debugData.imagesCount);
          console.log('  mockupImage:', debugData.mockupImage);
          console.log('  displayImage:', debugData.displayImage);
          console.log('  isLoading:', debugData.isLoading);
        }
      } catch (e) {
        console.log('Could not parse debug data');
      }
    } else {
      console.log('No debug log found. All console logs:');
      consoleLogs.forEach(log => console.log('  ', log));
    }

    // Check what image is actually rendered
    const imageInfo = await page.evaluate(() => {
      const finalReviewSection = document.getElementById('step-7');
      if (!finalReviewSection) return { exists: false };

      const img = finalReviewSection.querySelector('img[alt="Product mockup"]');

      return {
        exists: !!img,
        src: img?.getAttribute('src'),
        isVisible: img ? window.getComputedStyle(img).display !== 'none' : false,
        dimensions: img ? {
          width: (img as HTMLImageElement).width,
          height: (img as HTMLImageElement).height,
        } : null,
      };
    });

    console.log('\n=== IMAGE ELEMENT INFO ===');
    console.log(imageInfo);

    // Take screenshot
    await page.screenshot({
      path: 'playwright-screenshots/final-review-debug.png',
      fullPage: true
    });

    console.log('\nScreenshot saved to playwright-screenshots/final-review-debug.png');
  });

  test('should check query cache for product data', async ({ page }) => {
    await page.goto('/create-v2', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Inject code to inspect React Query cache
    const cacheInfo = await page.evaluate(() => {
      // Try to find React Query cache in window
      const queryClient = (window as any).queryClient;

      if (queryClient) {
        const cache = queryClient.getQueryCache();
        const queries = cache.getAll();

        return {
          hasQueryClient: true,
          queriesCount: queries.length,
          queries: queries.map((q: any) => ({
            queryKey: q.queryKey,
            state: q.state.status,
            dataKeys: q.state.data ? Object.keys(q.state.data) : null,
          })),
        };
      }

      return { hasQueryClient: false };
    });

    console.log('\n=== REACT QUERY CACHE INFO ===');
    console.log(JSON.stringify(cacheInfo, null, 2));
  });
});
