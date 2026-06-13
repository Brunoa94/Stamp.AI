import { test, expect } from '@playwright/test';

test.describe('Sidebar Navigation Click Test', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should click sidebar buttons and verify navigation', async ({ page }) => {
    page.on('console', msg => console.log('PAGE:', msg.text()));

    await page.goto('/create-v2', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Take initial screenshot
    await page.screenshot({
      path: 'playwright-screenshots/sidebar-before-click.png',
      fullPage: true
    });

    console.log('\n=== FINDING SIDEBAR BUTTONS ===');

    // Find all sidebar step buttons
    const sidebarButtons = await page.evaluate(() => {
      // Look for buttons in sidebar
      const buttons = Array.from(document.querySelectorAll('.icon-sidebar-progress-line ~ div button'));

      return buttons.map((btn, index) => {
        const rect = btn.getBoundingClientRect();
        return {
          index,
          text: btn.textContent?.trim(),
          title: btn.getAttribute('title'),
          classes: btn.className,
          isVisible: rect.width > 0 && rect.height > 0,
          x: rect.x,
          y: rect.y,
        };
      });
    });

    console.log('Sidebar buttons:', JSON.stringify(sidebarButtons, null, 2));

    // Try to find step 2 button
    const step2ButtonSelector = 'button[title="Synthesis Input"]';

    const step2Button = page.locator(step2ButtonSelector);
    const exists = await step2Button.count();

    console.log(`Step 2 button exists: ${exists > 0}`);

    if (exists > 0) {
      const isVisible = await step2Button.isVisible();
      console.log(`Step 2 button visible: ${isVisible}`);

      if (isVisible) {
        // Get initial state
        const beforeClick = await page.evaluate(() => {
          const activeSections = document.querySelectorAll('.stamp-section.active-section');
          return {
            activeCount: activeSections.length,
            activeId: activeSections[0]?.id,
          };
        });

        console.log('\nBefore click:', beforeClick);

        // Click the button
        console.log('\nClicking step 2 button...');
        await step2Button.click();

        // Wait a bit
        await page.waitForTimeout(200);

        // Take screenshot during transition
        await page.screenshot({
          path: 'playwright-screenshots/sidebar-during-transition.png',
          fullPage: true
        });

        // Wait for transition to complete
        await page.waitForTimeout(1000);

        // Take screenshot after
        await page.screenshot({
          path: 'playwright-screenshots/sidebar-after-click.png',
          fullPage: true
        });

        // Get state after click
        const afterClick = await page.evaluate(() => {
          const sections = Array.from(document.querySelectorAll('.stamp-section'));
          return sections.map(s => {
            const computed = window.getComputedStyle(s);
            return {
              id: s.id,
              hasActiveClass: s.classList.contains('active-section'),
              opacity: parseFloat(computed.opacity),
              visibility: computed.visibility,
            };
          });
        });

        console.log('\nAfter click:', JSON.stringify(afterClick, null, 2));

        // Check if step 2 is now active
        const step2State = afterClick.find(s => s.id === 'step-2');
        console.log('\nStep 2 state:', step2State);

        if (step2State?.hasActiveClass) {
          console.log('✅ Navigation worked!');
        } else {
          console.log('❌ Navigation FAILED - step 2 is not active');
        }
      } else {
        console.log('Step 2 button is not visible');
      }
    } else {
      console.log('Step 2 button not found');
      console.log('Looking for any buttons with tooltips...');

      const allButtons = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.map(btn => ({
          text: btn.textContent?.trim().substring(0, 30),
          title: btn.getAttribute('title'),
          ariaLabel: btn.getAttribute('aria-label'),
          hasTooltip: btn.hasAttribute('title') || btn.hasAttribute('aria-label'),
        }));
      });

      console.log('All buttons with potential tooltips:');
      allButtons.filter(b => b.hasTooltip).forEach(b => {
        console.log(`  - ${b.title || b.ariaLabel}`);
      });
    }
  });

  test('should monitor form state changes during navigation', async ({ page }) => {
    await page.goto('/create-v2', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Inject monitoring
    await page.evaluate(() => {
      const log: any[] = [];
      (window as any).formStateLog = log;

      // Try to intercept React form state changes
      setInterval(() => {
        const sections = document.querySelectorAll('.stamp-section');
        const activeSection = document.querySelector('.stamp-section.active-section');

        log.push({
          timestamp: Date.now(),
          activeId: activeSection?.id,
          allClasses: Array.from(sections).map(s => ({
            id: s.id,
            hasActive: s.classList.contains('active-section'),
          })),
        });
      }, 100);
    });

    // Click a sidebar button
    const button = page.locator('button').filter({ hasText: /synthesis/i }).first();
    const exists = await button.count();

    if (exists > 0) {
      await button.click();
      await page.waitForTimeout(2000);
    }

    const log = await page.evaluate(() => (window as any).formStateLog || []);

    console.log('\n=== FORM STATE LOG (last 20 entries) ===');
    log.slice(-20).forEach((entry: any) => {
      const activeSteps = entry.allClasses.filter((c: any) => c.hasActive).map((c: any) => c.id);
      console.log(`[${entry.timestamp}] Active: ${entry.activeId}, Steps with active class: ${activeSteps.join(', ')}`);
    });
  });
});
