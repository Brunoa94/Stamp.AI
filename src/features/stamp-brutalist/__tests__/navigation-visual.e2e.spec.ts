import { test, expect } from '@playwright/test';

/**
 * Visual E2E tests for Stamp Flow Navigation
 * Tests that don't require authentication
 */

test.describe('Stamp Navigation Visual Tests (No Auth)', () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // Bypass auth

  test('should render stamp page and show navigation structure', async ({ page }) => {
    // Navigate to the page
    await page.goto('/stamp', { waitUntil: 'networkidle' });

    // Wait a bit for React to hydrate
    await page.waitForTimeout(1000);

    // Take screenshot of initial state
    await page.screenshot({
      path: 'playwright-screenshots/stamp-initial.png',
      fullPage: true
    });

    // Check if sections exist
    const sections = page.locator('.stamp-section');
    const count = await sections.count();

    console.log(`Found ${count} sections`);

    // Log the sections
    for (let i = 0; i < count; i++) {
      const section = sections.nth(i);
      const id = await section.getAttribute('id');
      const hasActiveClass = await section.evaluate((el) =>
        el.classList.contains('active-section')
      );
      console.log(`Section ${i + 1}: id=${id}, active=${hasActiveClass}`);
    }
  });

  test('should check CSS properties of sections', async ({ page }) => {
    await page.goto('/stamp', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Get all sections
    const sections = page.locator('.stamp-section');
    const count = await sections.count();

    console.log(`\n=== CSS Properties for ${count} sections ===`);

    for (let i = 0; i < count; i++) {
      const section = sections.nth(i);
      const id = await section.getAttribute('id');

      const props = await section.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          id: el.id,
          hasActiveClass: el.classList.contains('active-section'),
          opacity: computed.opacity,
          visibility: computed.visibility,
          transform: computed.transform,
          zIndex: computed.zIndex,
          pointerEvents: computed.pointerEvents,
          position: computed.position,
        };
      });

      console.log(`\nSection: ${id}`);
      console.log(`  Active: ${props.hasActiveClass}`);
      console.log(`  Opacity: ${props.opacity}`);
      console.log(`  Visibility: ${props.visibility}`);
      console.log(`  Z-Index: ${props.zIndex}`);
      console.log(`  Pointer Events: ${props.pointerEvents}`);
      console.log(`  Transform: ${props.transform}`);
      console.log(`  Position: ${props.position}`);
    }

    // Take screenshot showing the state
    await page.screenshot({
      path: 'playwright-screenshots/sections-css-state.png',
      fullPage: true
    });
  });

  test('should verify active section is visible', async ({ page }) => {
    await page.goto('/stamp', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Find active section
    const activeSection = page.locator('.stamp-section.active-section').first();

    // Check if it exists
    const exists = await activeSection.count();
    console.log(`Active sections found: ${exists}`);

    if (exists > 0) {
      // Get its properties
      const props = await activeSection.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          id: el.id,
          opacity: parseFloat(computed.opacity),
          visibility: computed.visibility,
          zIndex: computed.zIndex,
          transform: computed.transform,
          isInViewport: rect.top >= 0 && rect.bottom <= window.innerHeight,
          rect: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          },
        };
      });

      console.log('\n=== Active Section Properties ===');
      console.log(`ID: ${props.id}`);
      console.log(`Opacity: ${props.opacity}`);
      console.log(`Visibility: ${props.visibility}`);
      console.log(`Z-Index: ${props.zIndex}`);
      console.log(`Transform: ${props.transform}`);
      console.log(`Is in viewport: ${props.isInViewport}`);
      console.log(`Rect:`, props.rect);

      // Verify it's actually visible
      expect(props.opacity).toBeGreaterThan(0.5);
      expect(props.visibility).toBe('visible');
    } else {
      console.log('NO ACTIVE SECTION FOUND!');

      // Debug: show all sections and their classes
      const allSections = await page.locator('.stamp-section').evaluateAll((sections) => {
        return sections.map((el) => ({
          id: el.id,
          classes: Array.from(el.classList),
          opacity: window.getComputedStyle(el).opacity,
        }));
      });

      console.log('\n=== All Sections Debug ===');
      console.log(JSON.stringify(allSections, null, 2));
    }

    // Take screenshot
    await page.screenshot({
      path: 'playwright-screenshots/active-section-state.png',
      fullPage: true
    });
  });

  test('should check if form context is working', async ({ page }) => {
    await page.goto('/stamp', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Check if React is hydrated and form context exists
    const formState = await page.evaluate(() => {
      // Try to find React root
      const root = document.getElementById('__next');
      return {
        hasRoot: !!root,
        sectionsCount: document.querySelectorAll('.stamp-section').length,
        activeSectionsCount: document.querySelectorAll('.stamp-section.active-section').length,
        snapContainerExists: !!document.getElementById('stamp-snap-root'),
      };
    });

    console.log('\n=== Form State Check ===');
    console.log(JSON.stringify(formState, null, 2));

    expect(formState.sectionsCount).toBeGreaterThan(0);
  });

  test('should wait for hydration and check useSnapScroll effect', async ({ page }) => {
    await page.goto('/stamp', { waitUntil: 'networkidle' });

    // Wait for React to hydrate and useEffect to run
    await page.waitForTimeout(3000);

    // Check the state after effects have run
    const state = await page.evaluate(() => {
      const sections = document.querySelectorAll('.stamp-section');
      const activeSections = document.querySelectorAll('.stamp-section.active-section');

      const sectionData = Array.from(sections).map((section) => {
        const computed = window.getComputedStyle(section);
        return {
          id: section.id,
          hasActiveClass: section.classList.contains('active-section'),
          opacity: computed.opacity,
          visibility: computed.visibility,
          zIndex: computed.zIndex,
        };
      });

      return {
        totalSections: sections.length,
        activeSections: activeSections.length,
        sectionData,
      };
    });

    console.log('\n=== After Hydration State ===');
    console.log(`Total sections: ${state.totalSections}`);
    console.log(`Active sections: ${state.activeSections}`);
    console.log('\nSection details:');
    state.sectionData.forEach((section) => {
      console.log(`  ${section.id}:`);
      console.log(`    Active: ${section.hasActiveClass}`);
      console.log(`    Opacity: ${section.opacity}`);
      console.log(`    Visibility: ${section.visibility}`);
      console.log(`    Z-Index: ${section.zIndex}`);
    });

    // Take final screenshot
    await page.screenshot({
      path: 'playwright-screenshots/after-hydration.png',
      fullPage: true
    });

    // Verify at least one section is active
    expect(state.activeSections).toBeGreaterThanOrEqual(1);
  });
});
