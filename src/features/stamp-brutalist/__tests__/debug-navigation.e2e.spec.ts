import { test, expect } from '@playwright/test';

test.describe('Debug Navigation Issue', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('should debug what happens during navigation', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    await page.goto('/create-v2', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('\n=== INITIAL STATE ===');

    // Check initial state
    const initialState = await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll('.stamp-section'));
      return sections.map((section, index) => {
        const computed = window.getComputedStyle(section);
        const rect = section.getBoundingClientRect();
        return {
          index: index + 1,
          id: section.id,
          hasActiveClass: section.classList.contains('active-section'),
          opacity: parseFloat(computed.opacity),
          visibility: computed.visibility,
          display: computed.display,
          zIndex: computed.zIndex,
          transform: computed.transform,
          isInViewport: rect.top >= 0 && rect.top < window.innerHeight,
          hasContent: section.textContent && section.textContent.trim().length > 0,
        };
      });
    });

    console.log('Initial sections:', JSON.stringify(initialState, null, 2));

    // Take screenshot
    await page.screenshot({
      path: 'playwright-screenshots/debug-initial.png',
      fullPage: true
    });

    // Try to manually trigger navigation by changing the form value
    console.log('\n=== ATTEMPTING NAVIGATION TO STEP 2 ===');

    // Inject a script to monitor changes
    await page.evaluate(() => {
      const log: string[] = [];
      (window as any).navigationLog = log;

      // Monitor all class changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const target = mutation.target as HTMLElement;
            const timestamp = Date.now();
            const computed = window.getComputedStyle(target);
            log.push(`[${timestamp}] ${target.id}: classes=${target.className}, opacity=${computed.opacity}, visibility=${computed.visibility}`);
          }
        });
      });

      observer.observe(document.body, {
        attributes: true,
        subtree: true,
        attributeFilter: ['class'],
      });

      console.log('Observer installed');
    });

    // Try to trigger navigation by clicking a button or changing form state
    // First, let's see if there's a way to navigate programmatically
    const canNavigate = await page.evaluate(() => {
      // Look for any navigation buttons or form controls
      const buttons = Array.from(document.querySelectorAll('button'));
      const buttonTexts = buttons.map(b => b.textContent?.trim());

      // Try to find the form context
      const hasFormProvider = document.querySelector('[data-testid="stamp-flow-container"]') !== null;

      return {
        buttonCount: buttons.length,
        buttonTexts: buttonTexts.slice(0, 10), // First 10 buttons
        hasFormProvider,
      };
    });

    console.log('Navigation controls:', JSON.stringify(canNavigate, null, 2));

    // Manually change the currentStep by modifying React state
    const navigationAttempt = await page.evaluate(() => {
      try {
        // Try to find the form and manually trigger a state change
        const step2 = document.getElementById('step-2');
        const step1 = document.getElementById('step-1');

        if (!step1 || !step2) {
          return { success: false, error: 'Sections not found' };
        }

        // Manually trigger the class change
        console.log('Before manual change - step1:', step1.classList.toString());
        console.log('Before manual change - step2:', step2.classList.toString());

        step1.classList.remove('active-section');
        step2.classList.add('active-section');

        console.log('After manual change - step1:', step1.classList.toString());
        console.log('After manual change - step2:', step2.classList.toString());

        return { success: true };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    });

    console.log('Navigation attempt:', navigationAttempt);

    // Wait for transition
    await page.waitForTimeout(1000);

    // Take screenshot during/after transition
    await page.screenshot({
      path: 'playwright-screenshots/debug-after-nav.png',
      fullPage: true
    });

    // Check state after transition
    console.log('\n=== STATE AFTER NAVIGATION ===');

    const afterState = await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll('.stamp-section'));
      return sections.map((section, index) => {
        const computed = window.getComputedStyle(section);
        const rect = section.getBoundingClientRect();
        return {
          index: index + 1,
          id: section.id,
          hasActiveClass: section.classList.contains('active-section'),
          opacity: parseFloat(computed.opacity),
          visibility: computed.visibility,
          display: computed.display,
          zIndex: computed.zIndex,
          transform: computed.transform,
          isInViewport: rect.top >= 0 && rect.top < window.innerHeight,
        };
      });
    });

    console.log('After navigation:', JSON.stringify(afterState, null, 2));

    // Get the mutation log
    const mutationLog = await page.evaluate(() => (window as any).navigationLog || []);
    console.log('\n=== MUTATION LOG ===');
    mutationLog.forEach((entry: string) => console.log(entry));

    // Check if anything is visible
    const visibleSections = afterState.filter(s => s.opacity > 0.1);
    console.log(`\nVisible sections after navigation: ${visibleSections.length}`);

    if (visibleSections.length === 0) {
      console.log('❌ NO SECTIONS VISIBLE - THIS IS THE BUG!');
    } else {
      console.log('✓ Sections are visible');
    }
  });

  test('should check if CSS is loading correctly', async ({ page }) => {
    await page.goto('/create-v2', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const cssCheck = await page.evaluate(() => {
      const section = document.querySelector('.stamp-section');
      if (!section) return { error: 'No section found' };

      const computed = window.getComputedStyle(section);

      // Check if our custom CSS is applied
      return {
        position: computed.position,
        hasAbsolutePosition: computed.position === 'absolute',
        transition: computed.transition,
        hasTransition: computed.transition.includes('opacity') || computed.transition.includes('transform'),
        opacity: computed.opacity,
        transform: computed.transform,
        visibility: computed.visibility,
        zIndex: computed.zIndex,
      };
    });

    console.log('\n=== CSS CHECK ===');
    console.log(JSON.stringify(cssCheck, null, 2));

    // Check active section CSS
    const activeCSS = await page.evaluate(() => {
      const activeSection = document.querySelector('.stamp-section.active-section');
      if (!activeSection) return { error: 'No active section found' };

      const computed = window.getComputedStyle(activeSection);

      return {
        opacity: parseFloat(computed.opacity),
        visibility: computed.visibility,
        zIndex: computed.zIndex,
        transform: computed.transform,
        pointerEvents: computed.pointerEvents,
      };
    });

    console.log('\n=== ACTIVE SECTION CSS ===');
    console.log(JSON.stringify(activeCSS, null, 2));

    expect(activeCSS.opacity).toBe(1);
  });
});
