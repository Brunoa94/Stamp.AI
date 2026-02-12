import { useEffect, useRef } from "react";
import useScrollToSection from "@/hooks/useScrollToSection";
import { CreateProductSelectors } from "../context/CreateProductContextSubscriber";

/**
 * Hook to manage navigation and scrolling between workflow steps
 * Automatically scrolls to relevant sections when state changes
 */
export function useCreateProductNavigation() {
  const { smoothScrollToSection } = useScrollToSection();

  // Subscribe to state changes
  const generatedResult = CreateProductSelectors.generatedResult();
  const createdProduct = CreateProductSelectors.createdProduct();

  // Create refs for sections
  const processingRef = useRef<HTMLElement | null>(null);
  const resultsRef = useRef<HTMLElement | null>(null);
  const productCustomizerRef = useRef<HTMLElement | null>(null);
  const createdProductRef = useRef<HTMLDivElement | null>(null);

  // Navbar height + spacing below navbar
  const SCROLL_OFFSET = -96;

  // Auto-scroll to results when generation is complete
  useEffect(() => {
    if (generatedResult) {
      const timeoutId = setTimeout(() => {
        smoothScrollToSection(resultsRef, {
          delay: 300,
          offset: SCROLL_OFFSET,
          block: "start",
        });
      }, 800);

      return () => clearTimeout(timeoutId);
    }
  }, [generatedResult, smoothScrollToSection]);

  // Auto-scroll to created product display when product is created
  useEffect(() => {
    if (createdProduct) {
      const timeoutId = setTimeout(() => {
        smoothScrollToSection(createdProductRef, {
          delay: 200,
          offset: SCROLL_OFFSET,
          block: "start",
        });
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [createdProduct, smoothScrollToSection]);

  // Scroll handlers for manual navigation
  const scrollToProcessing = () => {
    smoothScrollToSection(processingRef, {
      delay: 200,
      offset: SCROLL_OFFSET,
      block: "start",
    });
  };

  const scrollToCustomizer = () => {
    smoothScrollToSection(productCustomizerRef, {
      delay: 200,
      offset: SCROLL_OFFSET,
      block: "start",
    });
  };

  return {
    // Refs
    processingRef,
    resultsRef,
    productCustomizerRef,
    createdProductRef,

    // Manual scroll functions
    scrollToProcessing,
    scrollToCustomizer,
  };
}
