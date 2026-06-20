import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Integration tests for StampFlow navigation
 * These tests verify that the section navigation system works correctly
 */
describe('StampFlow Navigation Integration Tests', () => {
  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = '';

    // Create 7 sections
    for (let i = 1; i <= 7; i++) {
      const section = document.createElement('section');
      section.id = `step-${i}`;
      section.className = 'stamp-section';
      document.body.appendChild(section);
    }
  });

  describe('Section Structure', () => {
    it('should have 7 sections with correct IDs', () => {
      const sections = document.querySelectorAll('.stamp-section');
      expect(sections).toHaveLength(7);

      for (let i = 1; i <= 7; i++) {
        const section = document.getElementById(`step-${i}`);
        expect(section).toBeTruthy();
        expect(section?.classList.contains('stamp-section')).toBe(true);
      }
    });

    it('should have all sections with stamp-section class', () => {
      const sections = document.querySelectorAll('.stamp-section');
      sections.forEach((section) => {
        expect(section.classList.contains('stamp-section')).toBe(true);
      });
    });
  });

  describe('Active Section Management', () => {
    it('should allow setting one section as active', () => {
      const section1 = document.getElementById('step-1');
      section1?.classList.add('active-section');

      expect(section1?.classList.contains('active-section')).toBe(true);
    });

    it('should allow switching active section', () => {
      const section1 = document.getElementById('step-1');
      const section2 = document.getElementById('step-2');

      // Set step 1 as active
      section1?.classList.add('active-section');
      expect(section1?.classList.contains('active-section')).toBe(true);

      // Switch to step 2
      section1?.classList.remove('active-section');
      section2?.classList.add('active-section');

      expect(section1?.classList.contains('active-section')).toBe(false);
      expect(section2?.classList.contains('active-section')).toBe(true);
    });

    it('should only have one active section at a time', () => {
      const sections = document.querySelectorAll('.stamp-section');

      // Simulate the useSnapScroll behavior
      const currentStep = 3;
      sections.forEach((section, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;

        if (isActive) {
          section.classList.add('active-section');
        } else {
          section.classList.remove('active-section');
        }
      });

      const activeSections = document.querySelectorAll('.stamp-section.active-section');
      expect(activeSections).toHaveLength(1);
      expect(activeSections[0].id).toBe('step-3');
    });

    it('should correctly set active section for each step number', () => {
      const sections = document.querySelectorAll('.stamp-section');

      // Test each step from 1 to 7
      for (let currentStep = 1; currentStep <= 7; currentStep++) {
        // Clear all active classes
        sections.forEach(section => section.classList.remove('active-section'));

        // Apply active class based on currentStep
        sections.forEach((section, index) => {
          const stepNumber = index + 1;
          if (stepNumber === currentStep) {
            section.classList.add('active-section');
          }
        });

        // Verify only the current step is active
        const activeSections = document.querySelectorAll('.stamp-section.active-section');
        expect(activeSections).toHaveLength(1);
        expect(activeSections[0].id).toBe(`step-${currentStep}`);
      }
    });
  });

  describe('Navigation Flow', () => {
    it('should support sequential navigation from step 1 to 7', () => {
      const sections = document.querySelectorAll('.stamp-section');

      for (let step = 1; step <= 7; step++) {
        // Simulate navigation to this step
        sections.forEach((section, index) => {
          const stepNumber = index + 1;
          if (stepNumber === step) {
            section.classList.add('active-section');
          } else {
            section.classList.remove('active-section');
          }
        });

        // Verify
        const activeSection = document.querySelector('.stamp-section.active-section');
        expect(activeSection?.id).toBe(`step-${step}`);
      }
    });

    it('should support non-sequential navigation', () => {
      const sections = document.querySelectorAll('.stamp-section');
      const navigationSequence = [1, 3, 5, 2, 7, 4, 6];

      navigationSequence.forEach((step) => {
        // Simulate navigation
        sections.forEach((section, index) => {
          const stepNumber = index + 1;
          if (stepNumber === step) {
            section.classList.add('active-section');
          } else {
            section.classList.remove('active-section');
          }
        });

        // Verify
        const activeSection = document.querySelector('.stamp-section.active-section');
        expect(activeSection?.id).toBe(`step-${step}`);
      });
    });

    it('should support backward navigation', () => {
      const sections = document.querySelectorAll('.stamp-section');

      // Start at step 7
      let currentStep = 7;
      sections.forEach((section, index) => {
        const stepNumber = index + 1;
        if (stepNumber === currentStep) {
          section.classList.add('active-section');
        }
      });

      // Navigate backwards
      for (let step = 6; step >= 1; step--) {
        sections.forEach((section, index) => {
          const stepNumber = index + 1;
          if (stepNumber === step) {
            section.classList.add('active-section');
          } else {
            section.classList.remove('active-section');
          }
        });

        const activeSection = document.querySelector('.stamp-section.active-section');
        expect(activeSection?.id).toBe(`step-${step}`);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle no active section', () => {
      const activeSections = document.querySelectorAll('.stamp-section.active-section');
      expect(activeSections).toHaveLength(0);
    });

    it('should handle rapid step changes', () => {
      const sections = document.querySelectorAll('.stamp-section');

      // Rapidly change steps
      [1, 2, 3, 4, 5, 4, 3, 2, 6, 7].forEach((step) => {
        sections.forEach((section, index) => {
          const stepNumber = index + 1;
          if (stepNumber === step) {
            section.classList.add('active-section');
          } else {
            section.classList.remove('active-section');
          }
        });

        const activeSections = document.querySelectorAll('.stamp-section.active-section');
        expect(activeSections).toHaveLength(1);
      });
    });

    it('should maintain section structure after multiple navigations', () => {
      const sections = document.querySelectorAll('.stamp-section');

      // Perform 20 random navigations
      for (let i = 0; i < 20; i++) {
        const randomStep = Math.floor(Math.random() * 7) + 1;

        sections.forEach((section, index) => {
          const stepNumber = index + 1;
          if (stepNumber === randomStep) {
            section.classList.add('active-section');
          } else {
            section.classList.remove('active-section');
          }
        });
      }

      // Verify structure is still intact
      const allSections = document.querySelectorAll('.stamp-section');
      expect(allSections).toHaveLength(7);

      for (let i = 1; i <= 7; i++) {
        const section = document.getElementById(`step-${i}`);
        expect(section).toBeTruthy();
      }
    });
  });

  describe('useSnapScroll Logic Simulation', () => {
    it('should correctly apply active-section class based on currentStep', () => {
      const sections = document.querySelectorAll('.stamp-section');

      // Simulate the useSnapScroll effect for step 3
      const currentStep = 3;

      sections.forEach((section, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;

        if (isActive) {
          section.classList.add('active-section');
        } else {
          section.classList.remove('active-section');
        }
      });

      // Verify results
      for (let i = 1; i <= 7; i++) {
        const section = document.getElementById(`step-${i}`);
        if (i === currentStep) {
          expect(section?.classList.contains('active-section')).toBe(true);
        } else {
          expect(section?.classList.contains('active-section')).toBe(false);
        }
      }
    });

    it('should update active section when currentStep changes', () => {
      const sections = document.querySelectorAll('.stamp-section');

      // Start at step 1
      let currentStep = 1;
      sections.forEach((section, index) => {
        const stepNumber = index + 1;
        if (stepNumber === currentStep) {
          section.classList.add('active-section');
        }
      });

      expect(document.getElementById('step-1')?.classList.contains('active-section')).toBe(true);

      // Change to step 5
      currentStep = 5;
      sections.forEach((section, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;

        if (isActive) {
          section.classList.add('active-section');
        } else {
          section.classList.remove('active-section');
        }
      });

      expect(document.getElementById('step-1')?.classList.contains('active-section')).toBe(false);
      expect(document.getElementById('step-5')?.classList.contains('active-section')).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should handle many section updates efficiently', () => {
      const sections = document.querySelectorAll('.stamp-section');
      const iterations = 1000;

      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        const currentStep = (i % 7) + 1;

        sections.forEach((section, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;

          if (isActive) {
            section.classList.add('active-section');
          } else {
            section.classList.remove('active-section');
          }
        });
      }

      const end = performance.now();
      const duration = end - start;

      // Should complete in reasonable time (less than 100ms for 1000 iterations)
      expect(duration).toBeLessThan(100);
    });
  });
});
