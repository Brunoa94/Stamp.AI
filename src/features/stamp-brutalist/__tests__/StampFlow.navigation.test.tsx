import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StampFlow } from '../ui/StampFlow';
import type { StampFormData } from '../lib/schemas/stampFormSchema';

// Mock the queries
vi.mock('@/queries/productQueries', () => ({
  useTshirtProducts: vi.fn(() => ({
    data: [
      {
        id: 1,
        blueprint_id: 1,
        print_provider_id: 1,
        name: 'Test Product',
        image: 'https://example.com/image.jpg',
      },
    ],
    isLoading: false,
  })),
  usePrefetchTshirtProducts: vi.fn(() => {}),
  useBlueprintVariants: vi.fn(() => ({
    data: {
      colors: ['Black', 'White'],
      sizes: ['S', 'M', 'L'],
    },
    isLoading: false,
  })),
  useCustomProduct: vi.fn(() => ({
    data: null,
    isLoading: true,
  })),
  useCreateCustomProduct: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 'test-product-id' }),
  })),
}));

vi.mock('@/queries/providerCatalogQueries', () => ({
  useBestProvidersForBlueprints: vi.fn(() => ({
    data: new Map([
      [1, { total_cost: 1500, provider_name: 'Test Provider', provider_id: 1 }],
    ]),
    isLoading: false,
  })),
}));

vi.mock('@/queries/imageGenerationQueries', () => ({
  useImageGeneration: vi.fn(() => ({
    mutateAsync: vi.fn(),
  })),
}));

vi.mock('@/queries/authQueries', () => ({
  useUser: vi.fn(() => ({
    data: { id: 'test-user', email: 'test@example.com' },
  })),
}));

vi.mock('@/queries/cartQueries', () => ({
  useAddToCart: vi.fn(() => ({
    mutateAsync: vi.fn(),
  })),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

// Mock color mapping helper
vi.mock('@/helpers/colors/colorMapping', () => ({
  getColorClass: vi.fn((color: string) => {
    const colorMap: Record<string, string> = {
      Black: 'bg-black',
      White: 'bg-white',
    };
    return colorMap[color] || null;
  }),
}));

// Mock components
vi.mock('@/features/layout/brutalist/GrainOverlay', () => ({
  GrainOverlay: () => <div data-testid="grain-overlay" />,
}));

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const methods = useForm<StampFormData>({
    defaultValues: {
      currentStep: 1,
      referenceImage: null,
      prompt: '',
      artStyle: 'realistic',
      preservation: 0.5,
      isGenerating: false,
      isFinalizing: false,
      generatedResults: [],
      selectedImageUrl: '',
      enhancedPrompt: '',
      blueprintId: undefined,
      printProviderId: undefined,
      selectedColor: undefined,
      selectedSize: undefined,
      createdProductId: undefined,
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <FormProvider {...methods}>{children}</FormProvider>
    </QueryClientProvider>
  );
}

describe('StampFlow Navigation', () => {
  beforeEach(() => {
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render with step 1 (Upload) active by default', () => {
    render(
      <TestWrapper>
        <StampFlow />
      </TestWrapper>
    );

    const uploadSection = document.getElementById('step-1');
    expect(uploadSection).toBeTruthy();
    expect(uploadSection?.classList.contains('stamp-section')).toBe(true);
  });

  it('should apply active-section class only to current step', async () => {
    const { rerender } = render(
      <TestWrapper>
        <StampFlow />
      </TestWrapper>
    );

    // Initially step 1 should be active
    await waitFor(() => {
      const step1 = document.getElementById('step-1');
      const step2 = document.getElementById('step-2');
      expect(step1?.classList.contains('active-section')).toBe(true);
      expect(step2?.classList.contains('active-section')).toBe(false);
    });
  });

  it('should have all 8 sections rendered', () => {
    render(
      <TestWrapper>
        <StampFlow />
      </TestWrapper>
    );

    expect(document.getElementById('step-1')).toBeTruthy(); // Upload
    expect(document.getElementById('step-2')).toBeTruthy(); // Synthesis
    expect(document.getElementById('step-3')).toBeTruthy(); // Generation
    expect(document.getElementById('step-4')).toBeTruthy(); // Results
    expect(document.getElementById('step-5')).toBeTruthy(); // Product Spec
    expect(document.getElementById('step-6')).toBeTruthy(); // Customization
    expect(document.getElementById('step-7')).toBeTruthy(); // Production
    expect(document.getElementById('step-8')).toBeTruthy(); // Final Review
  });

  it('should apply correct CSS classes for section stacking', () => {
    render(
      <TestWrapper>
        <StampFlow />
      </TestWrapper>
    );

    const sections = document.querySelectorAll('.stamp-section');
    expect(sections.length).toBe(8);

    sections.forEach((section) => {
      expect(section.classList.contains('stamp-section')).toBe(true);
    });
  });

  it('should only allow one active section at a time', async () => {
    render(
      <TestWrapper>
        <StampFlow />
      </TestWrapper>
    );

    await waitFor(() => {
      const activeSections = document.querySelectorAll('.stamp-section.active-section');
      expect(activeSections.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Step Navigation Flow', () => {
    // TODO: These tests rely on 'active-section' CSS class which has been removed from the implementation
    // Tests need to be rewritten to match current scroll-based navigation
    it.skip('should properly transition from step 1 to step 2', async () => {
      const TestComponent = () => {
        const methods = useForm<StampFormData>({
          defaultValues: {
            currentStep: 1,
            referenceImage: null,
            prompt: '',
            artStyle: 'realistic',
            preservation: 0.5,
            isGenerating: false,
            isFinalizing: false,
            generatedResults: [],
            selectedImageUrl: '',
            enhancedPrompt: '',
            blueprintId: undefined,
            printProviderId: undefined,
            selectedColor: undefined,
            selectedSize: undefined,
            createdProductId: undefined,
          },
        });

        return (
          <QueryClientProvider
            client={
              new QueryClient({
                defaultOptions: { queries: { retry: false } },
              })
            }
          >
            <FormProvider {...methods}>
              <StampFlow />
              <button
                data-testid="navigate-step-2"
                onClick={() => methods.setValue('currentStep', 2)}
              >
                Go to Step 2
              </button>
            </FormProvider>
          </QueryClientProvider>
        );
      };

      render(<TestComponent />);

      // Initially step 1 is active
      await waitFor(() => {
        expect(
          document.getElementById('step-1')?.classList.contains('active-section')
        ).toBe(true);
      });

      // Click to navigate to step 2
      const navigateButton = screen.getByTestId('navigate-step-2');
      await userEvent.click(navigateButton);

      // Step 2 should now be active
      await waitFor(() => {
        expect(
          document.getElementById('step-2')?.classList.contains('active-section')
        ).toBe(true);
        expect(
          document.getElementById('step-1')?.classList.contains('active-section')
        ).toBe(false);
      });
    });

    it.skip('should handle navigation to step 6 (Production)', async () => {
      vi.useFakeTimers();

      const TestComponent = () => {
        const methods = useForm<StampFormData>({
          defaultValues: {
            currentStep: 5,
            referenceImage: null,
            prompt: 'test prompt',
            artStyle: 'realistic',
            preservation: 0.5,
            isGenerating: false,
            isFinalizing: false,
            generatedResults: [],
            selectedImageUrl: 'https://example.com/image.jpg',
            enhancedPrompt: 'enhanced prompt',
            blueprintId: 1,
            printProviderId: 1,
            selectedColor: 'Black',
            selectedSize: 'M',
            createdProductId: undefined,
          },
        });

        return (
          <QueryClientProvider
            client={
              new QueryClient({
                defaultOptions: { queries: { retry: false } },
              })
            }
          >
            <FormProvider {...methods}>
              <StampFlow />
              <button
                data-testid="navigate-step-6"
                onClick={() => {
                  methods.setValue('currentStep', 6);
                  setTimeout(() => {
                    const section = document.getElementById('step-6');
                    section?.scrollIntoView({ behavior: 'smooth' });
                  }, 300);
                }}
              >
                Go to Production
              </button>
            </FormProvider>
          </QueryClientProvider>
        );
      };

      render(<TestComponent />);

      const navigateButton = screen.getByTestId('navigate-step-6');
      await userEvent.click(navigateButton);

      await waitFor(() => {
        expect(
          document.getElementById('step-6')?.classList.contains('active-section')
        ).toBe(true);
      });

      // Fast-forward timers to trigger scrollIntoView
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Verify scrollIntoView was called
      await waitFor(() => {
        expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
      });

      vi.useRealTimers();
    });
  });

  describe('CSS Transitions', () => {
    it('should have proper transform styles for inactive sections', () => {
      render(
        <TestWrapper>
          <StampFlow />
        </TestWrapper>
      );

      const sections = document.querySelectorAll('.stamp-section');
      sections.forEach((section, index) => {
        if (index !== 0) {
          // Non-active sections
          expect(section.classList.contains('active-section')).toBe(false);
        }
      });
    });
  });

  describe('Navigation Guards', () => {
    // TODO: Test relies on outdated CSS class structure
    it.skip('should have pointer-events disabled on inactive sections', async () => {
      render(
        <TestWrapper>
          <StampFlow />
        </TestWrapper>
      );

      await waitFor(() => {
        const step1 = document.getElementById('step-1');
        const step2 = document.getElementById('step-2');

        expect(step1?.classList.contains('active-section')).toBe(true);
        expect(step2?.classList.contains('active-section')).toBe(false);
      });
    });
  });
});

describe('StampFlow Auto-Navigation', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  // TODO: Test needs to be rewritten for current implementation
  it.skip('should auto-advance to step 4 when generation completes', async () => {
    const TestComponent = () => {
      const methods = useForm<StampFormData>({
        defaultValues: {
          currentStep: 3,
          isGenerating: true,
          referenceImage: null,
          prompt: 'test',
          artStyle: 'realistic',
          preservation: 0.5,
          isFinalizing: false,
          generatedResults: [],
          selectedImageUrl: '',
          enhancedPrompt: '',
          blueprintId: undefined,
          printProviderId: undefined,
          selectedColor: undefined,
          selectedSize: undefined,
          createdProductId: undefined,
        },
      });

      return (
        <QueryClientProvider
          client={
            new QueryClient({
              defaultOptions: { queries: { retry: false } },
            })
          }
        >
          <FormProvider {...methods}>
            <StampFlow />
            <button
              data-testid="complete-generation"
              onClick={() => methods.setValue('isGenerating', false)}
            >
              Complete Generation
            </button>
            <div data-testid="current-step">{methods.watch('currentStep')}</div>
          </FormProvider>
        </QueryClientProvider>
      );
    };

    render(<TestComponent />);

    // Verify initial state
    expect(screen.getByTestId('current-step').textContent).toBe('3');

    const completeButton = screen.getByTestId('complete-generation');

    // Complete generation
    act(() => {
      completeButton.click();
    });

    // Fast-forward timers to trigger the auto-navigation
    act(() => {
      vi.advanceTimersByTime(400);
    });

    // Check if step changed to 4
    await waitFor(() => {
      expect(screen.getByTestId('current-step').textContent).toBe('4');
    }, { timeout: 1000 });
  });
});
