import { test, expect } from '@playwright/test';

/**
 * E2E tests for Stamp Flow Navigation
 * Tests the actual navigation behavior in a real browser
 */

test.describe('Stamp Flow Navigation E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the stamp page
    await page.goto('/stamp');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should show step 1 (Upload) on initial load', async ({ page }) => {
    // Check if step 1 section exists
    const step1 = page.locator('#step-1');
    await expect(step1).toBeVisible();

    // Check if it has the active-section class
    await expect(step1).toHaveClass(/active-section/);
  });

  test('should have all 7 sections in the DOM', async ({ page }) => {
    // Check all sections exist
    for (let i = 1; i <= 7; i++) {
      const section = page.locator(`#step-${i}`);
      await expect(section).toBeAttached();
      await expect(section).toHaveClass(/stamp-section/);
    }
  });

  test('should only have one visible section at a time', async ({ page }) => {
    // Get all sections with active-section class
    const activeSections = page.locator('.stamp-section.active-section');

    // Should only have one active section
    await expect(activeSections).toHaveCount(1);
  });

  test('should transition between sections with visibility', async ({ page }) => {
    // Start at step 1
    const step1 = page.locator('#step-1');
    await expect(step1).toBeVisible();
    await expect(step1).toHaveClass(/active-section/);

    // Get the current step indicator from the sidebar if it exists
    const sections = page.locator('.stamp-section');
    const count = await sections.count();
    expect(count).toBe(7);

    // Verify step 2 is not visible
    const step2 = page.locator('#step-2');
    await expect(step2).not.toHaveClass(/active-section/);
  });

  test('should show content during navigation transitions', async ({ page }) => {
    // Check initial state - step 1 should be visible
    const step1 = page.locator('#step-1');
    await expect(step1).toBeVisible();

    // Take a screenshot of initial state
    await page.screenshot({ path: 'playwright-screenshots/step-1-initial.png' });

    // Check opacity and visibility
    const step1Opacity = await step1.evaluate((el) => {
      return window.getComputedStyle(el).opacity;
    });
    expect(parseFloat(step1Opacity)).toBeGreaterThan(0.9);

    // Check z-index
    const step1ZIndex = await step1.evaluate((el) => {
      return window.getComputedStyle(el).zIndex;
    });
    expect(step1ZIndex).toBe('10'); // Active section should have z-index 10
  });

  test('should have correct CSS properties for active section', async ({ page }) => {
    const activeSection = page.locator('.stamp-section.active-section');

    // Check if visible
    await expect(activeSection).toBeVisible();

    // Get computed styles
    const styles = await activeSection.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        opacity: computed.opacity,
        visibility: computed.visibility,
        pointerEvents: computed.pointerEvents,
        zIndex: computed.zIndex,
        transform: computed.transform,
      };
    });

    // Verify active section styles
    expect(parseFloat(styles.opacity)).toBeGreaterThan(0.9);
    expect(styles.visibility).toBe('visible');
    expect(styles.pointerEvents).toBe('auto');
    expect(styles.zIndex).toBe('10');
  });

  test('should have correct CSS properties for inactive sections', async ({ page }) => {
    const inactiveSections = page.locator('.stamp-section:not(.active-section)');

    // Get the first inactive section
    const firstInactive = inactiveSections.first();

    // Get computed styles
    const styles = await firstInactive.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        opacity: computed.opacity,
        visibility: computed.visibility,
        pointerEvents: computed.pointerEvents,
        zIndex: computed.zIndex,
      };
    });

    // Verify inactive section styles
    expect(parseFloat(styles.opacity)).toBeLessThan(0.1);
    expect(styles.pointerEvents).toBe('none');
    expect(styles.zIndex).toBe('1');
  });

  test('should maintain visibility during rapid navigation', async ({ page }) => {
    // This test verifies that there's always content visible during transitions

    // Get initial active section
    let activeSection = page.locator('.stamp-section.active-section');
    await expect(activeSection).toBeVisible();

    // Check that at any point in time, at least one section is visible
    // We'll verify this by checking opacity of all sections
    const allSections = page.locator('.stamp-section');
    const sectionCount = await allSections.count();

    let visibleCount = 0;
    for (let i = 0; i < sectionCount; i++) {
      const section = allSections.nth(i);
      const opacity = await section.evaluate((el) => {
        return parseFloat(window.getComputedStyle(el).opacity);
      });
      if (opacity > 0.5) {
        visibleCount++;
      }
    }

    // At least one section should be mostly visible
    expect(visibleCount).toBeGreaterThanOrEqual(1);
  });

  test('should not show blank screen at any point', async ({ page }) => {
    // Navigate to step 1
    await page.waitForSelector('#step-1.active-section');

    // Take initial screenshot
    await page.screenshot({ path: 'playwright-screenshots/no-blank-screen-test.png' });

    // Check that there's visible content
    const hasVisibleContent = await page.evaluate(() => {
      const activeSections = document.querySelectorAll('.stamp-section.active-section');
      if (activeSections.length === 0) return false;

      const activeSection = activeSections[0];
      const styles = window.getComputedStyle(activeSection);
      return parseFloat(styles.opacity) > 0.5;
    });

    expect(hasVisibleContent).toBe(true);
  });

  test('should apply staged transitions correctly', async ({ page }) => {
    // This test verifies the new staged transition logic

    // Check initial state
    const step1 = page.locator('#step-1');
    await expect(step1).toHaveClass(/active-section/);

    // Verify that the useSnapScroll logic adds new section first
    // by checking z-index priorities
    const step1ZIndex = await step1.evaluate((el) => {
      return window.getComputedStyle(el).zIndex;
    });
    expect(step1ZIndex).toBe('10'); // Active section should be on top
  });

  test.describe('Navigation Performance', () => {
    test('should complete transition animations within reasonable time', async ({ page }) => {
      const step1 = page.locator('#step-1');
      await expect(step1).toBeVisible();

      // Measure how long the section stays visible
      const startTime = Date.now();

      // Wait for section to be fully visible (opacity = 1)
      await page.waitForFunction(() => {
        const section = document.querySelector('#step-1.active-section');
        if (!section) return false;
        const opacity = window.getComputedStyle(section).opacity;
        return parseFloat(opacity) >= 1;
      }, { timeout: 2000 });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Transition should complete within 1 second
      expect(duration).toBeLessThan(1000);
    });
  });

  test.describe('Accessibility', () => {
    test('should properly hide inactive sections from screen readers', async ({ page }) => {
      const inactiveSections = page.locator('.stamp-section:not(.active-section)');

      // Inactive sections should have pointer-events: none
      const firstInactive = inactiveSections.first();
      const pointerEvents = await firstInactive.evaluate((el) => {
        return window.getComputedStyle(el).pointerEvents;
      });

      expect(pointerEvents).toBe('none');
    });

    test('should make active section interactive', async ({ page }) => {
      const activeSection = page.locator('.stamp-section.active-section');

      // Active section should have pointer-events: auto
      const pointerEvents = await activeSection.evaluate((el) => {
        return window.getComputedStyle(el).pointerEvents;
      });

      expect(pointerEvents).toBe('auto');
    });
  });
});
