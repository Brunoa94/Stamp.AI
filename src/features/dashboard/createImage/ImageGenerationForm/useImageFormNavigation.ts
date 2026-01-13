import { useEffect, useRef } from "react";
import useScrollToSection from "@/hooks/useScrollToSection";

interface UseImageFormNavigationProps {
  isProcessing: boolean;
  generatedResult: any;
}

const useImageFormNavigation = ({
  isProcessing,
  generatedResult,
}: UseImageFormNavigationProps) => {
  const { smoothScrollToSection } = useScrollToSection();

  // Create refs for sections
  const processingRef = useRef<HTMLElement | null>(null);
  const resultsRef = useRef<HTMLElement | null>(null);
  const productCustomizerRef = useRef<HTMLElement | null>(null);

  // Auto-scroll to results when generation is complete
  useEffect(() => {
    if (generatedResult) {
      // Additional scroll trigger as backup
      const timeoutId = setTimeout(() => {
        smoothScrollToSection(resultsRef, { delay: 200, offset: -80 });
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [generatedResult, smoothScrollToSection]);

  // Function to handle form submission scroll
  const handleFormSubmit = () => {
    smoothScrollToSection(processingRef, { delay: 200, offset: -50 });
  };

  // Function to handle "Use this image" click
  const handleUseImage = () => {
    smoothScrollToSection(productCustomizerRef, { delay: 200, offset: -80 });
  };

  return {
    processingRef,
    resultsRef,
    productCustomizerRef,
    handleFormSubmit,
    handleUseImage,
  };
};

export default useImageFormNavigation;