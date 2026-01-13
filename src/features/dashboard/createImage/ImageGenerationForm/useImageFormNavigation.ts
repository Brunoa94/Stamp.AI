import { useEffect, useRef } from "react";
import useScrollToSection from "@/hooks/useScrollToSection";

interface UseImageFormNavigationProps {
  isProcessing: boolean;
  generatedResult: any;
  createdProduct?: any;
}

const useImageFormNavigation = ({
  isProcessing,
  generatedResult,
  createdProduct,
}: UseImageFormNavigationProps) => {
  const { smoothScrollToSection } = useScrollToSection();

  // Create refs for sections
  const processingRef = useRef<HTMLElement | null>(null);
  const resultsRef = useRef<HTMLElement | null>(null);
  const productCustomizerRef = useRef<HTMLElement | null>(null);
  const createdProductRef = useRef<HTMLDivElement | null>(null);

  // Navbar height + 96px spacing below navbar
  const SCROLL_OFFSET = -96;

  // Auto-scroll to results when generation is complete
  useEffect(() => {
    if (generatedResult) {
      // Wait longer for image to load before scrolling
      const timeoutId = setTimeout(() => {
        smoothScrollToSection(resultsRef, {
          delay: 300,
          offset: SCROLL_OFFSET,
          block: 'start'
        });
      }, 800);

      return () => clearTimeout(timeoutId);
    }
  }, [generatedResult, smoothScrollToSection]);

  // Function to handle form submission scroll
  const handleFormSubmit = () => {
    smoothScrollToSection(processingRef, {
      delay: 200,
      offset: SCROLL_OFFSET,
      block: 'start'
    });
  };

  // Function to handle "Use this image" click
  const handleUseImage = () => {
    smoothScrollToSection(productCustomizerRef, {
      delay: 200,
      offset: SCROLL_OFFSET,
      block: 'start'
    });
  };

  // Auto-scroll to created product display when product is created
  useEffect(() => {
    if (createdProduct) {
      const timeoutId = setTimeout(() => {
        smoothScrollToSection(createdProductRef, {
          delay: 200,
          offset: SCROLL_OFFSET,
          block: 'start'
        });
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [createdProduct, smoothScrollToSection]);

  return {
    processingRef,
    resultsRef,
    productCustomizerRef,
    createdProductRef,
    handleFormSubmit,
    handleUseImage,
  };
};

export default useImageFormNavigation;