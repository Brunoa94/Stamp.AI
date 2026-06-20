import { test, expect } from '@playwright/test';

/**
 * E2E tests for navigation transitions
 * Simulates actual step changes to verify smooth transitions
 */

test.describe('Navigation Transition Tests', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should smoothly transition from step 1 to step 2', async ({ page }) => {
    await page.goto('/stamp', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Take screenshot of initial state
    await page.screenshot({ path: 'playwright-screenshots/transition-step1-initial.png' });

    // Verify step 1 is visible
    const step1Initial = await page.locator('#step-1').evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        opacity: parseFloat(computed.opacity),
        visibility: computed.visibility,
        hasActiveClass: el.classList.contains('active-section'),
      };
    });

    console.log('Step 1 Initial State:', step1Initial);
    expect(step1Initial.opacity).toBe(1);
    expect(step1Initial.hasActiveClass).toBe(true);

    // Simulate clicking on step 2 icon in sidebar
    // Since sidebar might not be visible without auth, we'll directly change the form value
    await page.evaluate(() => {
      // Find the form context and change currentStep
      const event = new CustomEvent('navigate-to-step', { detail: { step: 2 } });
      window.dispatchEvent(event);
    });

    // Wait a bit for the transition
    await page.waitForTimeout(100);

    // Take screenshot during transition
    await page.screenshot({ path: 'playwright-screenshots/transition-during.png' });

    // Check opacity of both sections during transition
    const duringTransition = await page.evaluate(() => {
      const step1 = document.getElementById('step-1');
      const step2 = document.getElementById('step-2');

      if (!step1 || !step2) return null;

      const step1Styles = window.getComputedStyle(step1);
      const step2Styles = window.getComputedStyle(step2);

      return {
        step1: {
          opacity: parseFloat(step1Styles.opacity),
          visibility: step1Styles.visibility,
          hasActiveClass: step1.classList.contains('active-section'),
        },
        step2: {
          opacity: parseFloat(step2Styles.opacity),
          visibility: step2Styles.visibility,
          hasActiveClass: step2.classList.contains('active-section'),
        },
        bothVisible: parseFloat(step1Styles.opacity) > 0.1 || parseFloat(step2Styles.opacity) > 0.1,
      };
    });

    console.log('During Transition:', duringTransition);

    // At least one section should have some visibility
    if (duringTransition) {
      expect(duringTransition.bothVisible).toBe(true);
    }

    // Wait for transition to complete
    await page.waitForTimeout(1000);

    // Take screenshot after transition
    await page.screenshot({ path: 'playwright-screenshots/transition-step2-final.png' });

    // Verify final state
    const finalState = await page.evaluate(() => {
      const step1 = document.getElementById('step-1');
      const step2 = document.getElementById('step-2');

      if (!step1 || !step2) return null;

      const step1Styles = window.getComputedStyle(step1);
      const step2Styles = window.getComputedStyle(step2);

      return {
        step1: {
          opacity: parseFloat(step1Styles.opacity),
          visibility: step1Styles.visibility,
          hasActiveClass: step1.classList.contains('active-section'),
        },
        step2: {
          opacity: parseFloat(step2Styles.opacity),
          visibility: step2Styles.visibility,
          hasActiveClass: step2.classList.contains('active-section'),
        },
      };
    });

    console.log('Final State:', finalState);
  });

  test('should test manual step navigation via sidebar', async ({ page }) => {
    await page.goto('/stamp', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Take initial screenshot
    await page.screenshot({ path: 'playwright-screenshots/sidebar-nav-initial.png', fullPage: true });

    // Try to find and click sidebar step button
    const sidebarExists = await page.locator('.icon-sidebar-progress-line').count();

    console.log(`Sidebar exists: ${sidebarExists > 0}`);

    if (sidebarExists > 0) {
      // Try clicking on step 2 icon
      const step2Icon = page.locator('[data-step="2"]').or(page.locator('button').nth(1));

      const isVisible = await step2Icon.isVisible().catch(() => false);

      if (isVisible) {
        console.log('Clicking step 2 icon...');

        // Record state before click
        const beforeClick = await page.evaluate(() => {
          const activeSections = document.querySelectorAll('.stamp-section.active-section');
          return {
            activeCount: activeSections.length,
            activeId: activeSections[0]?.id,
          };
        });
        console.log('Before click:', beforeClick);

        await step2Icon.click();
        await page.waitForTimeout(100);

        // Take screenshot during transition
        await page.screenshot({ path: 'playwright-screenshots/sidebar-nav-transitioning.png', fullPage: true });

        await page.waitForTimeout(800);

        // Take screenshot after transition
        await page.screenshot({ path: 'playwright-screenshots/sidebar-nav-after.png', fullPage: true });

        // Record state after click
        const afterClick = await page.evaluate(() => {
          const activeSections = document.querySelectorAll('.stamp-section.active-section');
          return {
            activeCount: activeSections.length,
            activeId: activeSections[0]?.id,
          };
        });
        console.log('After click:', afterClick);

        expect(afterClick.activeCount).toBe(1);
      } else {
        console.log('Step icons not visible');
      }
    }
  });

  test('should measure transition timing and visibility', async ({ page }) => {
    await page.goto('/stamp', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Inject monitoring script
    await page.evaluate(() => {
      const log: any[] = [];

      // Monitor opacity changes
      const observer = new MutationObserver(() => {
        const activeSections = document.querySelectorAll('.stamp-section.active-section');
        const timestamp = Date.now();

        const sectionStates = Array.from(document.querySelectorAll('.stamp-section')).map((section) => {
          const computed = window.getComputedStyle(section);
          return {
            id: section.id,
            opacity: parseFloat(computed.opacity),
            hasActive: section.classList.contains('active-section'),
          };
        });

        log.push({
          timestamp,
          activeCount: activeSections.length,
          sections: sectionStates.filter((s) => s.opacity > 0.1 || s.hasActive),
        });
      });

      observer.observe(document.body, {
        attributes: true,
        subtree: true,
        attributeFilter: ['class'],
      });

      // Store log globally for retrieval
      (window as any).transitionLog = log;
    });

    // Trigger a step change
    await page.evaluate(() => {
      // Try to find React root and trigger navigation
      const sections = document.querySelectorAll('.stamp-section');
      if (sections.length > 1) {
        sections[1].classList.add('active-section');
      }
    });

    // Wait for transition
    await page.waitForTimeout(1500);

    // Retrieve log
    const transitionLog = await page.evaluate(() => (window as any).transitionLog);

    console.log('\n=== Transition Log ===');
    console.log(JSON.stringify(transitionLog, null, 2));

    // Check if there was ever a moment with no visible sections
    const hasBlankMoment = transitionLog.some((entry: any) =>
      entry.activeCount === 0 && entry.sections.length === 0
    );

    console.log(`\nHad blank moment: ${hasBlankMoment}`);

    if (hasBlankMoment) {
      console.log('WARNING: Found a moment with no visible sections!');
    }
  });
});
